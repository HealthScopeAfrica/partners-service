import express from "express";
import { approvePartner, createPartner } from "../../controllers/users/partner.controller";
import { validate } from "../../middlewares/validators/index";
import { partnerProfileIdValidator, approvePartnerQueryValidator, createPartnerValidator } from "../../middlewares/validators/users/partner.validation";
import { authenticate, adminOnly } from "../../middlewares/auth";

const router = express.Router();

// POST /api/v1/partner - Create new partner account (Public - no auth needed)
router.post("/partner", 
  validate(createPartnerValidator),
  createPartner
);

// PATCH /api/v1/partner/:id?action=approve|reject - Approve/Reject partner (Admin only)
router.patch("/partner/:id", 
  authenticate,                                     // Require JWT authentication
  adminOnly,                                        // Require admin role
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(approvePartnerQueryValidator, 'query'),  // Validate ?action= query
  approvePartner
);

export default router;
