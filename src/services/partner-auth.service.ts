import { AccountModel } from "../models/users/account.model";
import { PartnerProfileModel } from "../models/users/partner-profile.model";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

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


//get partner name from partner profile
const getPartnerName = async (accountId: string): Promise<string> => {
   const profile = await PartnerProfileModel.findOne({ accountId: accountId });
  const partnerName = profile?.organization?.name ?? 'Partner';
  return partnerName;
};


// Verify password reset request: check account exists and return info for token generation
export const validatePartnerAccount = async (
  identifier: string
): Promise<{ userId: string; email: string; partnerName: string } | null> => {
  const account = await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() }
    ],
    role: 'partner',
    status: 'enabled'
  });

  if (!account) {
    return null;
  }

  const partnerName = await getPartnerName(account._id.toString());

  return {
    userId: account._id.toString(),
    email: account.email,
    partnerName
  };
};




// Reset partner password using userId and email (extra validation)
export const resetPartnerPassword = async (
  userId: string,
  email: string,
  newPassword: string
): Promise<{ account: any; newPassword: string; partnerName: string } | null> => {
  const account = await AccountModel.findOne({ _id: userId, email });
  if (!account) {
    return null;
  }
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  const updatedAccount = await AccountModel.findByIdAndUpdate(account._id, { passwordHash }, { new: true });
  const partnerName = await getPartnerName(account._id.toString());
  return { account: updatedAccount, newPassword, partnerName };
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
