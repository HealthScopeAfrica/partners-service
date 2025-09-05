import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validators/index";
import { loginValidator, refreshTokenValidator } from "../middlewares/validators/auth.validation";
import { authenticate } from "../middlewares/auth.middleware";

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
 * GET /api/v1/auth/me
 * Get current user profile
 * Headers: Authorization: Bearer <token>
 */
router.get("/partner", authenticate, getCurrentUser);

export default router;
