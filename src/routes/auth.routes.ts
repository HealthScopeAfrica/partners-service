import { Router } from 'express';
import { 
  login, 
  refreshToken, 
  verifyTokenEndpoint, 
  logout, 
  getCurrentUser 
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validators/index';
import { 
  loginValidator
} from '../middlewares/validators/auth.validation';
import { authenticate } from '../middlewares/auth';

/**
 * AUTH ROUTES
 * 
 * Authentication and authorization endpoints
 * Base path: /api/v1/auth
 */

const router = Router();

/**
 * POST /api/v1/auth/login
 * Login for all user types (partner, admin, contributor, reader)
 * Body: { identifier: string, password: string }
 */
router.post('/login', 
  validate(loginValidator, 'body'), 
  login
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token from cookie
 * No body validation needed - token comes from HTTP-only cookie
 */
router.post('/refresh', 
  refreshToken
);

/**
 * GET /api/v1/auth/verify
 * Verify current access token (for debugging/testing)
 * Headers: Authorization: Bearer <token>
 */
router.get('/verify', 
  authenticate, 
  verifyTokenEndpoint
);

/**
 * POST /api/v1/auth/logout
 * Logout current user
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', 
  authenticate, 
  logout
);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', 
  authenticate, 
  getCurrentUser
);

export default router;
