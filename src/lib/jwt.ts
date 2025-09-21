import jwt from 'jsonwebtoken';

/**
 * JWT UTILITY MODULE
 * 
 * Simple JWT handling for partner authentication
 * - Access tokens: Bearer auth (15m)
 * - Refresh tokens: Cookie-based (1h)
 */

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '1h';

// Token payload interfaces
export interface TokenPayload {
  userId: string;
  email: string;
  role: 'partner'; // Only partner for now
  iat?: number;
  exp?: number;
}

// Generic temporary token payload
export interface TemporaryTokenPayload {
  userId: string;
  email: string;
  purpose: string; // e.g., 'password-reset', 'email-verification', etc.
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token (Bearer token)
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions);
};

/**
 * Generate stateless temporary token (JWT, short expiry, generic purpose)
 */
export const generateTemporaryToken = (
  payload: Omit<TemporaryTokenPayload, 'iat' | 'exp'>,
  expiresIn: string = '5m'
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn
  } as jwt.SignOptions);
};

/**
 * Verify temporary token and return payload, optionally check purpose
 */
export const verifyTemporaryToken = (
  token: string,
  expectedPurpose?: string
): TemporaryTokenPayload => {
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TemporaryTokenPayload;
    if (expectedPurpose && decoded.purpose !== expectedPurpose) {
  throw new Error('Invalid temp token purpose');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('invalid or expired temp token');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid temp token');
    } else {
      throw new Error('Temp token verification failed');
    }
  }
};

/**
 * Generate JWT refresh token (for cookies)
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  } as jwt.SignOptions);
};

/**
 * Verify JWT token and return payload
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header (Bearer token)
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};
