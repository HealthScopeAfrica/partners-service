
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { approvePartnerAccount, createPartnerAccount, findPartnerByEmail } from "../services/users/partner.service";
import {sendEmail} from "../lib/utils";
import {approvalMail} from "../emails/approvalMail";
import {rejectionMail} from "../emails/rejectionMail";
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
    const decision = req.query.decision;
    const role = req.user?.role as string;

    if (!req.user || role !== 'admin') {
      res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
      return;
    }

    if (decision !== 'approve' && decision !== 'reject') {
      res.status(400).json({ success: false, message: 'Invalid query parameter, must be approve or reject' });
      return;
    }
    const result = await approvePartnerAccount(partnerProfileId, decision);
    const { partner, account, loginCredentials } = result;
    const recipient = partner?.organization?.email;
    const subject = decision === 'approve' ? 'Your partner account has been approved' : 'Your partner account has been rejected';
    const body = decision === 'approve' ? approvalMail(partner?.organization?.name, loginCredentials?.partnerId, loginCredentials?.password) : rejectionMail(partner?.organization?.name);
 if (recipient) {
    if (decision === 'approve') {
      // Send email with login credentials
        await sendEmail(subject, body, recipient);
      
      res.status(200).json({ success: true, data: { partner, account }});
    } else {
       await sendEmail(subject, body, recipient);
      res.status(200).json({ success: false, message: 'Partner account rejected successfully' });
    }}
    
  } catch (error) {
    next(error);
  }
}


