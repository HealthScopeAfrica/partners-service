import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { approvePartnerAccount, createPartnerAccount, findPartnerByEmail, suspendPartnerAccount } from "../services/users/partner.service";
import {sendEmail} from "../lib/utils";
import {approvalMail} from "../emails/approvalMail";
import {rejectionMail} from "../emails/rejectionMail";
import { profileCreationMail } from "../emails/profileCreationMail";
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
    const body = profileCreationMail(partnerData.organization.name);
    const subject = 'Your Application to Join the HealthScope Partner Network';
    const recipient = partnerData.organization.email;
    try {
      await sendEmail(subject, body, recipient);
    } catch (error) {
      console.error('Email delivery failed:', error);
    }
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully, please check your email for more info',
      data: newPartner
    });
  } catch (error) {
    next(error);
  }
}; 


/**
 * Approve a partner account
 * Route: PATCH /api/v1/partner/:id/review?query=string
 * /api/v1/partner/:id?action=string
 * string: approve / reject
 * Access: Admin
 */
export const approvePartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partnerProfileId = new Types.ObjectId(req.params.id);
    const decision = req.query.decision;
  
    if (decision !== 'approve' && decision !== 'reject') {
      res.status(400).json({ success: false, message: 'Invalid query parameter, must be approve or reject' });
      return;
    }
    const result = await approvePartnerAccount(partnerProfileId, decision);
    const { partner, account, loginCredentials } = result;
    const recipient = partner?.organization?.email;
    const subject = 'Healthscope Partnership Application Feedback';
    const body = decision === 'approve' ? approvalMail(partner?.organization?.name, loginCredentials?.partnerId, loginCredentials?.password) : rejectionMail(partner?.organization?.name);
    if (recipient) {
      try {
        await sendEmail(subject, body, recipient);
      } catch (err) { 
        // Log error for internal monitoring, do not expose to user
        console.error('Email delivery failed:', err);
      }
      if (decision === 'approve') {
        res.status(200).json({ success: true, data: { partner, account }});
      } else {
        res.status(200).json({ success: false, message: 'Partner account rejected successfully' });
      }
    }
  } catch (error) {
    next(error);
  }
}


/**
 * Suspend partner
 *  Route: PATCH /api/v1/partner/:id/access?query=string
 * /api/v1/partner/:id?suspend=true
 * string: true/false
 * Access: Admin
 */
export const suspendPartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = new Types.ObjectId(req.params.id);
    const suspend = req.query.suspend === 'true'; // convert string to boolean
   const result =  await suspendPartnerAccount(accountId, suspend);
   if (!result) {
     res.status(404).json({ success: false, message: 'Partner not found' });
     return;
   }
    res.status(200).json({ success: true, message: suspend ? 'Partner account suspended successfully' : 'Partner account reinstated successfully' });
  } catch (error) {
    next(error);
  }
};