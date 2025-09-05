import express from "express";
import { approvePartner, createPartner, suspendPartner } from "../controllers/partner.controller";
import { validate } from "../middlewares/validators/index";
import { partnerProfileIdValidator, approvePartnerQueryValidator, createPartnerValidator, suspendReinstatePartnerQueryValidator } from "../middlewares/validators/partner.validation";

const router = express.Router();

// POST /api/v1/partner - Create new partner account
router.post("/partner", 
  validate(createPartnerValidator),
  createPartner
);

// PATCH /api/v1/partner/:id - Approve or reject partner account
router.patch("/partner/:id", 
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(approvePartnerQueryValidator, 'query'),  // Validate ?action= query
  approvePartner
);


// PATCH /api/v1/partner/:id - Suspend or reinstate partner account
router.patch("/partner/:id", 
  validate(partnerProfileIdValidator, 'params'),    // Validate :id parameter
  validate(suspendReinstatePartnerQueryValidator, 'query'),  // Validate ?suspend= query
  suspendPartner
);

export default router;
