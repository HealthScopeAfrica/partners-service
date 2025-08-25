
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { approvePartnerAccount, createPartnerAccount, findPartnerByEmail } from "../../services/users/partner.service";

/**
 * Create a new partner account
 * Route: POST /api/v1/partner
 * Access: Public
 */
export const createPartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body is already validated by middleware
    const partnerData = req.body;
    const partnerProfileExist = await findPartnerByEmail(partnerData.organization.email, partnerData.organization.name);
    if (partnerProfileExist) {
      res.status(409).json({ success: false, message: 'Partner profile already exists' });
      return;
    }
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


/**
 * Approve a partner account
 * Route: PATCH /api/v1/partner/:id?query=string
 * /api/v1/partner/:id?action=string
 * string: approve / reject
 * Access: Admin
 */
export const approvePartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partnerProfileId = new Types.ObjectId(req.params.id);
    const action = req.query.action;
    // const role = req.user.role;

    // if (role !== 'admin') {
    //   res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    //   return;
    // }

    if (action !== 'approve' && action !== 'reject') {
      res.status(400).json({ success: false, message: 'Invalid query parameter, must be approve or reject' });
      return;
    }
    const result = await approvePartnerAccount(partnerProfileId, action);
    if (action === 'approve') {
      res.status(200).json({ success: true, data: result });
    } else {
      res.status(200).json({ success: true, message: 'Partner account rejected successfully' });
    }
  } catch (error) {
    next(error);
  }
}



