import express from "express";
import { approvePartner, createPartner, suspendPartner } from "../controllers/partner.controller";
import { validate } from "../middlewares/validators/index";
import { partnerProfileIdValidator, approvePartnerQueryValidator, createPartnerValidator, suspendReinstatePartnerQueryValidator } from "../middlewares/validators/partner.validation";
import { authorize } from "../middlewares/auth.middleware";

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

export default router;
