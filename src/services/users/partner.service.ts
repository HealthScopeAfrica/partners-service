

import { PartnerProfileModel, type PartnerProfile } from "../../models/users/partner-profile.model";
import { AccountModel, type Account } from "../../models/users/account.model";
import { Types } from "mongoose";
import { generatePartnerId, generateSecurePassword } from "../../lib/utils";
import { generateTokenPair, TokenPayload } from "../../lib/jwt";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";


/**
 * PARTNER SERVICE
 * 
 * This service handles all partner database operations (create, read, update, delete).
 * 
 * WHY SERVICE LAYER:
 * - Separates business logic from HTTP controllers
 * - Makes code reusable and testable
 * - Database operations return Promises (use async/await to handle them)
 * 
 * USAGE: Import these functions in your controllers to interact with partner data
 */

// Create new partner in database (registration - creates pending PartnerProfile only)
export const createPartnerAccount = async (partnerData: PartnerProfile): Promise<PartnerProfile> => {
  const newPartner = new PartnerProfileModel(partnerData);
  return await newPartner.save();
};

// Approve partner and create linked Account (admin function)
export const approvePartnerAccount = async (partnerProfileId: Types.ObjectId, action: string): Promise<{ 
  partner: PartnerProfile; 
  account?: Account; 
  loginCredentials?: { partnerId: string; email: string; password: string };
}> => {
  // First, find the partner to check current status
  const existingPartner = await PartnerProfileModel.findById(partnerProfileId);
  
  if (!existingPartner) {
    throw createHttpError(404, 'Partner not found');
  }

  // Check if the partner is already in the requested state
  if (existingPartner.status === action + 'ed' || 
      (action === 'approve' && existingPartner.status === 'approved') ||
      (action === 'reject' && existingPartner.status === 'rejected')) {
    throw createHttpError(400, `Partner is already ${existingPartner.status}`);
  }

  // For rejection, update status and handle account cleanup if needed
  if (action === 'reject') {
    // If partner was previously approved, remove their account
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

  // For approval, handle different scenarios
  let account: Account | undefined;
  let loginCredentials: { partnerId: string; email: string; password: string } | undefined;

  // Check if partner was previously approved and still has an account
  if (existingPartner.status === 'approved' && existingPartner.accountId) {
    // Partner is already approved with an existing account
    const existingAccount = await AccountModel.findById(existingPartner.accountId);
    if (existingAccount) {
      throw createHttpError(400, 'Partner is already approved with an active account');
    }
  }

  // Check for duplicate accounts by email (for new approvals or re-approvals)
  // Only check for duplicate accounts, not duplicate partners with same email
  const duplicateAccount = await AccountModel.findOne({ email: existingPartner.organization.email });
  if (duplicateAccount) {
    throw createHttpError(409, 'An account with this email already exists. Cannot approve partner.');
  }

  // Update partner status to approved
  const partner = await PartnerProfileModel.findByIdAndUpdate(
    partnerProfileId,
    { status: 'approved' },
    { new: true }
  );

  // Auto-generate secure partner ID and password using utilities
  const generatedPartnerId = await generatePartnerId();
  const tempPassword = generateSecurePassword();

  // Hash the password securely
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

  // Create the Account with auto-generated credentials
  const newAccount = new AccountModel({
    role: 'partner',
    email: partner.organization.email,
    partnerId: generatedPartnerId,
    passwordHash: passwordHash, // Now properly hashed
    status: 'enabled'
  });
  account = await newAccount.save();

  // Link the account to the partner profile
  partner.accountId = (account as any)._id as Types.ObjectId;
  await partner.save();

  // Return login credentials to send via email (password is plain text for email)
  loginCredentials = {
    partnerId: generatedPartnerId,
    email: partner.organization.email,
    password: tempPassword // Plain text for email - hash is stored in DB
  };

  return { partner, account, loginCredentials };
};

// Authenticate partner login (accepts either email OR partnerId + password)
export const authenticatePartner = async (identifier: string, password: string): Promise<Account | null> => {
  // Find account by email or partnerId
  const account = await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ],
    role: 'partner',
    status: 'enabled'
  });

  if (!account || !account.passwordHash) {
    throw createHttpError(404, 'Account not found please register as a partner');
  }

  // Verify password against hash
  const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
  
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid login parameters please check your credentials');
  }

  // Update last login timestamp
  account.lastLoginAt = new Date();
  await account.save();

  return account;
};

// Verify password only (helper function)
export const verifyPartnerPassword = async (identifier: string, password: string): Promise<boolean> => {
  const account = await authenticatePartner(identifier, password);
  return account !== null;
};

// Reset partner password (generates new password and returns it for email. May be handles by admin only)
export const resetPartnerPassword = async (identifier: string): Promise<{ account: any; newPassword: string } | null> => {
  // Find the account
  const account = await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ],
    role: 'partner',
    status: 'enabled'
  });

  if (!account) {
    throw createHttpError(404, 'Account not found');
  }

  // Generate new secure password
  const newPassword = generateSecurePassword();
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update account with new password hash
  const updatedAccount = await AccountModel.findByIdAndUpdate(
    account._id, 
    { passwordHash },
    { new: true }
  );

  return { account: updatedAccount, newPassword }; // Return plain password for email
};

// Change partner password (when they know current password)
export const changePartnerPassword = async (identifier: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  // First verify current password
  const account = await authenticatePartner(identifier, currentPassword);
  
  if (!account) {
    return false; // Invalid current password
  }

  // Hash new password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update account with new password hash using the account we already have
  await AccountModel.findByIdAndUpdate((account as any)._id, { passwordHash });

  return true;
};

// Find partner account by email or partnerId (helper function)
export const findPartnerAccount = async (identifier: string): Promise<Account | null> => {
  return await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ],
    role: 'partner'
  });
};

// Get partner with linked account data
export const getPartnerWithAccount = async (partnerId: Types.ObjectId): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findById(partnerId).populate('accountId');
};

// Update existing partner
export const updatePartnerAccount = async (id: Types.ObjectId, partnerData: Partial<PartnerProfile>): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findByIdAndUpdate(id, partnerData, { new: true });
};

// Delete partner from database (also removes linked Account)
export const deletePartnerAccount = async (id: Types.ObjectId): Promise<PartnerProfile | null> => {
  const partner = await PartnerProfileModel.findById(id);
  
  if (partner?.accountId) {
    // Delete linked account first
    await AccountModel.findByIdAndDelete(partner.accountId);
  }
  
  // Then delete partner profile
  return await PartnerProfileModel.findByIdAndDelete(id);
};

// Update partner image/logo
export const uploadPartnerImage = async (id: Types.ObjectId, imagePath: string): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findByIdAndUpdate(
    id, 
    { 'organization.logoUrl': imagePath }, // Using correct field from your model
    { new: true }
  );
};


//find partner by email or name
export const findPartnerByEmail = async (email: string, name: string): Promise<PartnerProfile | null> => {
  return await PartnerProfileModel.findOne({ 'organization.email': email, 'organization.name': name });
};


