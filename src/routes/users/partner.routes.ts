import express from "express";
import { createPartner } from "../../controllers/users/partner.controller";
import { validate } from "../../middlewares/validators/index";
import { createPartnerValidator } from "../../middlewares/validators/users/partner.validation";

const router = express.Router();

// POST /api/v1/partner - Create new partner account
router.post("/partner", 
  validate(createPartnerValidator),
  createPartner
);

export default router;
