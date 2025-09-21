import Joi from 'joi';

/**
 * AUTH VALIDATION SCHEMAS
 * 
 * Joi validation schemas for authentication endpoints
 */

// Login validation
export const loginValidator = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or Partner ID is required',
      'string.empty': 'Email or Partner ID cannot be empty'
    }),
  
  password: Joi.string()
    .min(7)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/)
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 7 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)'
    })
});

// Token refresh validation
export const refreshTokenValidator = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
      'string.empty': 'Refresh token cannot be empty'
    })
});

// Change password validation
export const changePasswordValidator = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Old password is required',
      'string.empty': 'Old password cannot be empty'
    }),
  
  newPassword: Joi.string()
    .min(7)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/)
    .required()
    .messages({
      'any.required': 'New password is required',
      'string.empty': 'New password cannot be empty',
      'string.min': 'New password must be at least 7 characters long',
      'string.pattern.base': 'New password must include uppercase, lowercase, number, and special character',
    }),
});

// Reset password request validation
export const requestPasswordResetValidator = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or Partner ID is required',
      'string.empty': 'Email or Partner ID cannot be empty'
    })
});

// Set new password validation
export const setNewPasswordValidator = Joi.object({
  email: Joi.string().email()
    .required()
    .messages({
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),

  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token is required',
      'string.empty': 'Token cannot be empty'
    }),

  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'any.required': 'New password is required',
      'string.empty': 'New password cannot be empty',
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must be less than 64 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character'
    })
});

    