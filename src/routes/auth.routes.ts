import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  verifyPasswordResetToken,
  setNewPasswordAfterReset,
  changePassword,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validators/index";
import {
  changePasswordValidator,
  loginValidator,
  refreshTokenValidator,
  requestPasswordResetValidator,
  setNewPasswordValidator,
} from "../middlewares/validators/auth.validation";
import {
  authenticate,
  authorize,
  checkPartnerSuspension,
} from "../middlewares/auth.middleware";
import { changePartnerPassword } from "../services/partner-auth.service";

/**
 * AUTH ROUTES
 *
 * Authentication and authorization endpoints
 * Base path: /api/v1/
 */

const router = Router();

/**
 * POST /api/v1/auth/login
 * Login for all user types (partner, admin, contributor, reader)
 * Body: { identifier: string, password: string }
 */
router.post("/partner/auth/login", validate(loginValidator, "body"), login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token from cookie
 * No body validation needed - token comes from HTTP-only cookie
 */
router.post("/partner/auth/refresh-token", refreshToken);

/**
 * POST /api/v1/auth/logout
 * Logout current user
 * Headers: Authorization: Bearer <token>
 */
router.post("/partner/auth/logout", authenticate, logout);

/**
 * POST /api/v1/auth/reset-password/request
 * Request password reset link
 * Body: { identifier: string }
 */
router.post(
  "/partner/auth/reset-password/request",
  validate(requestPasswordResetValidator, "body"),
  requestPasswordReset
);

/**
 * POST /api/v1/auth/reset-password/verify
 * Verify password reset token and reset password
 * Body: { identifier: string, newPassword: string }
 */
router.get("/partner/auth/reset-password/verify", verifyPasswordResetToken);

/** PATCH /api/v1/auth/reset-password
 * Set new password after verifying reset token
 * Body: { userId: string, email: string, newPassword: string }
 */
router.patch(
  "/partner/auth/reset-password",
  validate(setNewPasswordValidator, "body"),
  setNewPasswordAfterReset
);

/** PATCH /api/v1/partner/auth/change-password
 * Change password for partner
 * Body: {oldPassword: string, newPassword: string }
 */
router.patch(
  "/partner/auth/change-password",
  validate(changePasswordValidator, "body"),
  authenticate,
  authorize("partner"),
  changePassword
);

export default router;
