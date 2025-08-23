import Joi from 'joi';

// Simple validation schemas matching your actual models

/**
 * Create partner validation - matches PartnerProfile model structure
 */
export const createPartnerValidator = Joi.object({
  organization: Joi.object({
    name: Joi.string().trim().required().messages({
      'string.empty': 'Organization name is required',
      'any.required': 'Organization name is required'
    }),
    email: Joi.string().email().trim().required().messages({
      'string.email': 'Please provide a valid organization email',
      'string.empty': 'Organization email is required',
      'any.required': 'Organization email is required'
    }),
    shortName: Joi.string().trim().optional(),
    regNumber: Joi.string().trim().optional(),
    type: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    country: Joi.string().trim().optional(),
    hqCity: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    website: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    logoUrl: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid logo URL'
    })
  }).required().messages({
    'any.required': 'Organization details are required'
  }),

  contactPerson: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    role: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    email: Joi.string().email().trim().optional().messages({
      'string.email': 'Please provide a valid contact person email'
    })
  }).optional()
});

/**
 * Update partner validation - all fields optional
 */
export const updatePartnerValidator = Joi.object({
  organization: Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().trim().optional().messages({
      'string.email': 'Please provide a valid organization email'
    }),
    shortName: Joi.string().trim().optional(),
    regNumber: Joi.string().trim().optional(),
    type: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    country: Joi.string().trim().optional(),
    hqCity: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    website: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    logoUrl: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid logo URL'
    })
  }).optional(),

  contactPerson: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    role: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    email: Joi.string().email().trim().optional().messages({
      'string.email': 'Please provide a valid contact email'
    })
  }).optional()
});

/**
 * Partner login validation
 */
export const partnerLoginValidator = Joi.object({
  partnerId: Joi.string().trim().required().messages({
    'string.empty': 'Partner ID is required',
    'any.required': 'Partner ID is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

/**
 * Partner ID parameter validation
 */
export const partnerIdParamValidator = Joi.object({
  partnerId: Joi.string().pattern(/^PTR-\d{9}$/).required().messages({
    'string.pattern.base': 'Invalid partner ID format. Expected format: PTR-XXXXXXXXX',
    'string.empty': 'Partner ID is required',
    'any.required': 'Partner ID is required'
  })
});

/**
 * Status update validation
 */
export const updatePartnerStatusValidator = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required().messages({
    'any.only': 'Status must be one of: pending, approved, rejected',
    'string.empty': 'Status is required',
    'any.required': 'Status is required'
  })
});

/**
 * Tier update validation  
 */
export const updatePartnerTierValidator = Joi.object({
  tier: Joi.string().valid('standard', 'featured').required().messages({
    'any.only': 'Tier must be either standard or featured',
    'string.empty': 'Tier is required',
    'any.required': 'Tier is required'
  })
});
