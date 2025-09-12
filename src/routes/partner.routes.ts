import express from "express";
import { approvePartner, createPartner, suspendPartner } from "../controllers/partner.controller";
import { validate } from "../middlewares/validators/index";
import { partnerProfileIdValidator, approvePartnerQueryValidator, createPartnerValidator, suspendReinstatePartnerQueryValidator } from "../middlewares/validators/partner.validation";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { getCurrentPartner, getAllPartners } from "../controllers/partner.controller";

const router = express.Router();

// POST /api/v1/partner - Create new partner account
router.post("/partner", 
  validate(createPartnerValidator),
  createPartner
);

// PATCH /api/v1/partner/:id/review - Approve or reject partner account
router.patch("/partner/:id/review", 
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(approvePartnerQueryValidator, 'query'),  // Validate ?decision= query
  //authorize('admin'),
  approvePartner
);


// PATCH /api/v1/partner/:id/access - Suspend or reinstate partner account
router.patch("/partner/:id/access", 
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(suspendReinstatePartnerQueryValidator, 'query'),  // Validate ?suspend= query
  //authorize('admin'),
  suspendPartner
);


/**
 * GET /api/v1/me
 * Get current user profile
 */
router.get("/partner", authenticate, authorize('partner'), getCurrentPartner);


/**
 * GET /api/v1/partners
 * Get all partners user profile
 GET /api/v1/partners?search=&type=&status=&tier=&country=&page=&limit=&sort=&order=
 */
router.get("/partners", authenticate, getAllPartners);




export default router;