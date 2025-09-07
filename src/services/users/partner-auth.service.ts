import { AccountModel } from "../../models/users/account.model";
import { PartnerProfileModel } from "../../models/users/partner-profile.model";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { generateSecurePassword } from "../../lib/utils";

// verify partner credentials
export const authenticatePartner = async (identifier: string, password: string): Promise<any> => {
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
  const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid login parameters please check your credentials');
  }
  account.lastLoginAt = new Date();
  await account.save();
  return account;
};


// verify partner password
export const verifyPartnerPassword = async (identifier: string, password: string): Promise<boolean> => {
  const account = await authenticatePartner(identifier, password);
  return account !== null;
};

// reset partner password
export const resetPartnerPassword = async (identifier: string): Promise<{ account: any; newPassword: string } | null> => {
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
  const newPassword = generateSecurePassword();
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  const updatedAccount = await AccountModel.findByIdAndUpdate(
    account._id, 
    { passwordHash },
    { new: true }
  );
  return { account: updatedAccount, newPassword };
};


// change partner password
export const changePartnerPassword = async (identifier: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  const account = await authenticatePartner(identifier, currentPassword);
  if (!account) {
    return false;
  }
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  await AccountModel.findByIdAndUpdate((account as any)._id, { passwordHash });
  return true;
};


// verify partner suspension status
export const isPartnerSuspended = async (identifier: string): Promise<boolean> => {
  const partner = await PartnerProfileModel.findOne({
    $or: [
      { "organization.email": identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ]
  });
  return partner?.isSuspended ?? false; 
};
