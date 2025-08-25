import express from "express";
import { approvePartner, createPartner } from "../../controllers/users/partner.controller";
import { validate } from "../../middlewares/validators/index";
import { partnerProfileIdValidator, approvePartnerQueryValidator, createPartnerValidator } from "../../middlewares/validators/users/partner.validation";

const router = express.Router();

// POST /api/v1/partner - Create new partner account
router.post("/partner", 
  validate(createPartnerValidator),
  createPartner
);

// In your partner routes
router.patch("/partner/:id", 
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(approvePartnerQueryValidator, 'query'),  // Validate ?action= query
  approvePartner
);

export default router;
