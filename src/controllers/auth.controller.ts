import { Request, Response, NextFunction } from "express";
import { authenticatePartner } from "../services/users/partner.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  TokenPayload,
} from "../lib/jwt";
import createHttpError from "http-errors";
import { AccountModel } from "../models/users/account.model";
import { PartnerProfileModel } from "../models/users/partner-profile.model";

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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and partner profile data
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken
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
    const refreshToken = req.cookies.refreshToken;

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
    res.clearCookie("refreshToken", {
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
 * Get current user profile
 * GET /api/v1/auth/partner
 * Headers: Authorization: Bearer <token>
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createHttpError(401, "Authentication required");
    }

    // Get partner profile (since userId is now partner profile ID)
    const partnerProfile = await PartnerProfileModel.findById(req.user.userId);

    if (!partnerProfile) {
      throw createHttpError(404, "Partner profile not found");
    }

    res.status(200).json({
      success: true,
      data: {
        partner: partnerProfile
      },
    });
  } catch (error) {
    next(error);
  }
};
