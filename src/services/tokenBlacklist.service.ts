import { TokenPayload, verifyToken } from '../lib/jwt';

/**
 * TOKEN BLACKLIST SERVICE
 * 
 * Simple in-memory blacklist for logged-out JWT tokens
 * In production, use Redis for better performance and scalability
 */

// In-memory blacklist (use Redis in production)
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist when user logs out
 */
export const blacklistToken = (token: string): void => {
  try {
    // Verify token first to get expiration time
    const payload = verifyToken(token);
    
    // Only blacklist if token is still valid
    if (payload.exp && payload.exp > Date.now() / 1000) {
      tokenBlacklist.add(token);
      
      // Auto-remove from blacklist after expiration (cleanup)
      const expiresIn = (payload.exp * 1000) - Date.now();
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, expiresIn);
    }
  } catch (error) {
    // Token already invalid/expired, no need to blacklist
  }
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

/**
 * Get blacklist size (for monitoring)
 */
export const getBlacklistSize = (): number => {
  return tokenBlacklist.size;
};

/**
 * Clear expired tokens from blacklist (manual cleanup)
 */
export const cleanupBlacklist = (): void => {
  for (const token of tokenBlacklist) {
    try {
      const payload = verifyToken(token);
      if (!payload.exp || payload.exp <= Date.now() / 1000) {
        tokenBlacklist.delete(token);
      }
    } catch (error) {
      // Token invalid, remove from blacklist
      tokenBlacklist.delete(token);
    }
  }
};
