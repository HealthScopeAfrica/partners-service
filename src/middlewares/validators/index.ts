import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import createHttpError from 'http-errors';

/**
 * Generic validation middleware factory
 * @param schema - Joi validation schema
 * @param property - Request property to validate ('body' | 'params' | 'query')
 * @returns Express middleware function
 */
export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false, // Don't allow unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      next(createHttpError(400, `Validation Error: ${errorMessage}`));
      return;
    }

    // Replace the original data with validated/sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validation helper for optional fields
 * @param schema - Base Joi schema
 * @returns Schema with all fields optional
 */
export const makeOptional = (schema: Joi.ObjectSchema): Joi.ObjectSchema => {
  const keys = schema.describe().keys;
  const optionalKeys: Record<string, Joi.Schema> = {};

  for (const [key, value] of Object.entries(keys)) {
    optionalKeys[key] = (value as any).optional();
  }

  return Joi.object(optionalKeys);
};
