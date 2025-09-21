import { Request, Response, NextFunction } from "express";
import {
  authenticatePartner,
  isPartnerSuspended,
  manageTemporaryToken,
  resetPartnerPassword,
  validatePartnerAccount,
} from "../services/partner-auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  TokenPayload,
  generateTemporaryToken,
  TemporaryTokenPayload,
  verifyTemporaryToken,
} from "../lib/jwt";
import createHttpError from "http-errors";
import { AccountModel } from "../models/users/account.model";
import { PartnerProfileModel } from "../models/users/partner-profile.model";
import { passwordResetConfirmationMail } from "../emails/passwordResetConfirmationMail";
import { generateSecurePassword, sendEmail } from "../lib/utils";
import { passwordResetSuccessMail } from "../emails/passwordResetSuccessMail";

/**
 * AUTH CONTROLLER
 *
 * Handles authentication endpoints for partners:
 * - Login (partners only)
 * - Token refresh
 * - Logout
 * - Token verification
 */

/**
 * Login endpoint for partners
 * POST /api/v1/auth/partner/
 * Body: { identifier: string, password: string }
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw createHttpError(400, "Email/Partner ID and password are required");
    }

    const isSuspended = await isPartnerSuspended(identifier);
    if (isSuspended) {
      // Block login and return suspension message
      throw createHttpError(
        403,
        "Your account has been suspended, please contact support."
      );
    }

    // Authenticate partner
    const account = await authenticatePartner(identifier, password);

    if (!account) {
      throw createHttpError(401, "Invalid credentials");
    }

    // Find the partner profile using account ID
    const partnerProfile = await PartnerProfileModel.findOne({
      accountId: (account as any)._id,
    });

    if (!partnerProfile) {
      throw createHttpError(404, "Partner profile not found");
    }

    // Generate JWT tokens using partner profile ID (not account ID)
    const tokenPayload: Omit<TokenPayload, "iat" | "exp"> = {
      userId: (partnerProfile as any)._id.toString(), // Use partner profile ID
      email: account.email,
      role: "partner", // Explicitly set to partner since we verified it's a partner account
    };

    // Generate tokens separately
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set refresh token as HTTP-only cookie
    res.cookie("partner_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Return access token and partner profile data
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Token refresh endpoint
 * POST /api/v1/auth/refresh
 * Reads refresh token from HTTP-only cookie
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get refresh token from cookie instead of body
    const refreshToken = req.cookies.partner_refresh_token;

    if (!refreshToken) {
      throw createHttpError(401, "Refresh token not found");
    }

    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      throw createHttpError(401, "Invalid or expired refresh token");
    }

    // Find the partner profile to verify it still exists
    const partnerProfile = await PartnerProfileModel.findById(payload.userId);
    if (!partnerProfile) {
      throw createHttpError(401, "Partner profile not found");
    }

    // Find account to verify it's still active
    const account = await AccountModel.findById(partnerProfile.accountId);
    if (!account || account.status !== "enabled") {
      throw createHttpError(401, "Account not found or disabled");
    }

    // Generate new access token with same payload
    const tokenPayload: Omit<TokenPayload, "iat" | "exp"> = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout endpoint
 * POST /api/v1/auth/logout
 * Headers: Authorization: Bearer <token>
 *
 * Clears the HTTP-only refresh token cookie
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("partner_refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * request password reset
 * POST /api/v1/auth/password-reset/request
 * Body: { identifier: string }
 */

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      throw createHttpError(400, "Email/Partner ID is required");
    }
    const data = await validatePartnerAccount(identifier);
    if (!data) {
      console.info(
        "Password reset requested for non-existent or suspended account:",
        identifier
      );
      res.status(200).json({
        success: true,
        message:
          "if the account exists, you will receive an email with password reset instructions",
      });
      return;
    }
    const { userId, email, partnerName } = data;
    const TemporaryTokenPayload: TemporaryTokenPayload = {
      userId,
      email,
      purpose: "password-reset",
    };
    const token = generateTemporaryToken(TemporaryTokenPayload, "5m");
    if (!token) {
      throw createHttpError(500, "Failed to generate password reset token");
    }

    // save token to db
    await manageTemporaryToken(userId, "store", token);

    const resetLink = `${
      process.env.PARTNER_FRONTEND_URL
    }/partner/reset-password/verify?token=${token}&email=${encodeURIComponent(
      email
    )}`;
    // Send password reset email
    const subject = "Password Reset Request Confirmation";

    const recipient = email;
    const body = passwordResetConfirmationMail(
      partnerName,
      resetLink,
      "5 minutes"
    );
    try {
      await sendEmail(subject, body, recipient);
      console.info("Password reset email sent to:", email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
    res.status(200).json({
      success: true,
      message:
        "If the account exists, you will receive an email with password reset instructions.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify password reset token and email match
 * GET /api/v1/auth/password-reset/verify?token=...&email=...
 */
export const verifyPasswordResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, email } = req.query;
    if (
      !token ||
      !email ||
      typeof token !== "string" ||
      typeof email !== "string"
    ) {
      throw createHttpError(400, "Token and email are required");
    }

    const payload = verifyTemporaryToken(token, "password-reset");

    if (payload.email !== email) {
      throw createHttpError(401, "Invalid or expired password reset link");
    }

    res.status(200).json({
      success: true,
      message:
        "Password reset link verified successfully. You may now set a new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set new password after verifying token and email
 * POST /api/v1/auth/password-reset/set
 * Body: { token: string, email: string, newPassword: string }
 */
export const setNewPasswordAfterReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      throw createHttpError(400, "Token, email, and new password are required");
    }
    const payload = verifyTemporaryToken(token, "password-reset");

    if (payload.email !== email) {
      throw createHttpError(401, "Invalid or expired password reset link");
    }
    const isTempTokenAlreadyUsed = await manageTemporaryToken(
      payload.userId,
      "verify",
      token
    );
    if (isTempTokenAlreadyUsed === false) {
      throw createHttpError(
        401,
        "Oops! This password reset link has already been used. Please request a new one."
      );
    }
    const result = await resetPartnerPassword(
      payload.userId,
      email,
      newPassword
    );
    if (!result) {
      throw createHttpError(404, "Account not found");
    }
    // Send confirmation email
    const subject = "Your Password Has Been Reset";
    const body = passwordResetSuccessMail(result.partnerName);
    try {
      await sendEmail(subject, body, email);
      console.info("Password reset email sent to:", email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
    await manageTemporaryToken(payload.userId, "clear");
    res.status(200).json({
      success: true,
      message:
        "Your password has been reset. You may now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
