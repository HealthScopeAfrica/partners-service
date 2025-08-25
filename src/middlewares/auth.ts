import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '../lib/jwt';

/**
 * JWT AUTHENTICATION MIDDLEWARE
 * 
 * Simple middleware for partner authentication
 */

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware - Verifies JWT Bearer token
 * Adds partner info to req.user if token is valid
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw createHttpError(401, 'Access token required');
    }

    // Verify token and extract payload
    const payload = verifyToken(token);
    
    // Ensure it's a partner token
    if (payload.role !== 'partner') {
      throw createHttpError(403, 'Partner access required');
    }
    
    // Add user info to request
    req.user = payload;
    
    next();
  } catch (error: any) {
    if (error.message === 'Token has expired') {
      next(createHttpError(401, 'Access token has expired'));
    } else if (error.message === 'Invalid token') {
      next(createHttpError(401, 'Invalid access token'));
    } else {
      next(createHttpError(401, 'Authentication failed'));
    }
  }
};
