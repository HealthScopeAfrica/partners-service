import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '../lib/jwt';
import { isPartnerSuspended } from '../services/partner-auth.service';
import { Types } from 'mongoose';

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
 * 1. AUTHENTICATE: Verifies JWT and attaches req.user (any role)
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

/**
 * 2. AUTHORIZE: Restricts access by role
 * Usage: authorize('partner'), authorize('admin')
 */
export function authorize(role: string[] | string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (Array.isArray(role) ? !role.includes(req.user.role) : req.user.role !== role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    next();
  };
}

/**
 * 3. checkPartnerSuspension: Blocks suspended partners (for partner routes only)
 */
export const checkPartnerSuspension = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'partner') return next(); // Only check for partners
    const { email } = req.user;
    const isSuspended = await isPartnerSuspended(email);
    if (isSuspended) {
      throw createHttpError(403, "Your account has been suspended, please contact support.");
    }
    next();
  } catch (error) {
    next(error);
  }
};
