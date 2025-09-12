import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  requestPasswordReset,
 verifyPasswordResetToken,
 setNewPasswordAfterReset
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validators/index";
import { loginValidator, refreshTokenValidator, requestPasswordResetValidator, setNewPasswordValidator } from "../middlewares/validators/auth.validation";
import { authenticate, authorize, checkPartnerSuspension } from "../middlewares/auth.middleware";

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
router.post("/auth/login", validate(loginValidator, "body"), login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token from cookie
 * No body validation needed - token comes from HTTP-only cookie
 */
router.post("/auth/refresh-token", refreshToken);

/**
 * POST /api/v1/auth/logout
 * Logout current user
 * Headers: Authorization: Bearer <token>
 */
router.post("/auth/logout", authenticate,  logout);


/**
 * POST /api/v1/auth/reset-password/request
 * Request password reset link
 * Body: { identifier: string }
 */
router.post("/auth/reset-password/request", validate(requestPasswordResetValidator, "body"), requestPasswordReset);

/**
 * POST /api/v1/auth/reset-password/verify
 * Verify password reset token and reset password
 * Body: { identifier: string, newPassword: string }
 */
router.get("/auth/reset-password/verify", verifyPasswordResetToken);

/** POST /api/v1/auth/reset-password
 * Set new password after verifying reset token
 * Body: { userId: string, email: string, newPassword: string }
 */
router.post("/auth/reset-password", validate(setNewPasswordValidator, "body"), setNewPasswordAfterReset);

export default router;
