
import { Request, Response, NextFunction } from "express";
import { createPartnerAccount } from "../../services/users/partner.service";

/**
 * Create a new partner account
 * Route: POST /api/v1/partner
 * Access: Public
 */
export const createPartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body is already validated by middleware
    const partnerData = req.body;
    const newPartner = await createPartnerAccount(partnerData);
    
    res.status(201).json({
      success: true,
      message: 'Partner account created successfully, please check your email for more info',
      data: newPartner
    });
  } catch (error) {
    next(error);
  }
}; 
