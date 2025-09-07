import { PartnerProfileModel, type PartnerProfile } from "../../models/users/partner-profile.model";
import { AccountModel, type Account } from "../../models/users/account.model";
import { Types } from "mongoose";
import createHttpError from "http-errors";
import { generatePartnerId, generateSecurePassword } from "../../lib/utils";
import bcrypt from "bcrypt";

// Create new partner in database (registration - creates pending PartnerProfile only)
export const createPartnerAccount = async (partnerData: PartnerProfile): Promise<PartnerProfile> => {
  const newPartner = new PartnerProfileModel(partnerData);
  return await newPartner.save();
};

// Approve partner and create linked Account (admin function)
export const approvePartnerAccount = async (partnerProfileId: Types.ObjectId, decision: string): Promise<{ 
  partner: PartnerProfile; 
  account?: Account; 
  loginCredentials?: { partnerId: string; email: string; password: string };
}> => {
  // First, find the partner to check current status
  const existingPartner = await PartnerProfileModel.findById(partnerProfileId);
  if (!existingPartner) {
    throw createHttpError(404, 'Partner not found');
  }
  if (existingPartner.status === decision + 'ed' || 
      (decision === 'approve' && existingPartner.status === 'approved') ||
      (decision === 'reject' && existingPartner.status === 'rejected')) {
    throw createHttpError(400, `Partner is already ${existingPartner.status}`);
  }
  if (decision === 'reject') {
    if (existingPartner.status === 'approved' && existingPartner.accountId) {
      await AccountModel.findByIdAndDelete(existingPartner.accountId);
    }
    const rejectedPartner = await PartnerProfileModel.findByIdAndUpdate(
      partnerProfileId,
      { status: 'rejected', accountId: null },
      { new: true }
    );
    return { partner: rejectedPartner! };
  }
  let account: Account | undefined;
  let loginCredentials: { partnerId: string; email: string; password: string } | undefined;
  const duplicateAccount = await AccountModel.findOne({ email: existingPartner.organization.email });
  if (duplicateAccount) {
    throw createHttpError(409, 'An account with this email already exists. Cannot approve partner.');
  }
  const partner = await PartnerProfileModel.findByIdAndUpdate(
    partnerProfileId,
    { status: 'approved' },
    { new: true }
  );
  const generatedPartnerId = await generatePartnerId();
  const tempPassword = generateSecurePassword();
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(tempPassword, saltRounds);
  const newAccount = new AccountModel({
    role: 'partner',
    email: partner.organization.email,
    partnerId: generatedPartnerId,
    passwordHash: passwordHash,
    status: 'enabled'
  });
  account = await newAccount.save();
  partner.accountId = (account as any)._id as Types.ObjectId;
  await partner.save();
  loginCredentials = {
    partnerId: generatedPartnerId,
    email: partner.organization.email,
    password: tempPassword
  };
  return { partner, account, loginCredentials };
};


// Suspend a partner account
export const suspendPartnerAccount = async (id: Types.ObjectId, suspend: boolean): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findByIdAndUpdate(id, { isSuspended: suspend }, { new: true });
};


// Find a partner account by email or partnerId
export const findPartnerAccount = async (identifier: string): Promise<Account | null> => {
  return await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ],
    role: 'partner'
  });
};


// Get partner profile with account details
export const getPartnerWithAccount = async (partnerId: Types.ObjectId): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findById(partnerId).populate('accountId');
};


// Update a partner account
export const updatePartnerAccount = async (id: Types.ObjectId, partnerData: Partial<PartnerProfile>): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findByIdAndUpdate(id, partnerData, { new: true });
};


// Delete a partner account
export const deletePartnerAccount = async (id: Types.ObjectId): Promise<PartnerProfile | null> => {
  const partner = await PartnerProfileModel.findById(id);
  if (partner?.accountId) {
    await AccountModel.findByIdAndDelete(partner.accountId);
  }
  return await PartnerProfileModel.findByIdAndDelete(id);
};


// Upload a partner logo image
export const uploadPartnerImage = async (id: Types.ObjectId, imagePath: string): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findByIdAndUpdate(
    id, 
    { 'organization.logoUrl': imagePath },
    { new: true }
  );
};

// Find a partner account by email or partnerId
export const findPartnerByEmail = async (email: string, name: string): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findOne({ 'organization.email': email, 'organization.name': name });
};
