import { AccountModel } from "../models/users/account.model";
import { PartnerProfileModel } from "../models/users/partner-profile.model";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

// verify partner credentials
export const authenticatePartner = async (
  identifier: string,
  password: string
): Promise<any> => {
  const account = await AccountModel.findOne({
  
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() },
    ],
    role: "partner",
    status: "enabled",
  });
    
  if (!account || !account.passwordHash) {
   console.error("Account not found or invalid credentials");
   return null;
  }
  const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
  if (!isPasswordValid) {
    console.error("Invalid password for account:", identifier);
    return null;
  }
  account.lastLoginAt = new Date();
  await account.save();
  return account;
};

//get partner name from partner profile
const getPartnerName = async (accountId: string): Promise<string> => {
  const profile = await PartnerProfileModel.findOne({ accountId: accountId });
  const partnerName = profile?.organization?.name ?? "Partner";
  return partnerName;
};

// Verify password reset request: check account exists and return info for token generation
export const validatePartnerAccount = async (
  identifier: string
): Promise<{ userId: string; email: string; partnerName: string } | null> => {
  const account = await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() },
    ],
    role: "partner",
    status: "enabled",
  });

  if (!account) {
    return null;
  }

  const partnerName = await getPartnerName(account._id.toString());

  return {
    userId: account._id.toString(),
    email: account.email,
    partnerName,
  };
};

// Reset partner password using userId and email (extra validation)
export const resetPartnerPassword = async (
  userId: string,
  email: string,
  newPassword: string
): Promise<{ account: any; partnerName: string } | null> => {
  const account = await AccountModel.findOne({ _id: userId, email });
  if (!account) {
    return null;
  }

  // Check old password
  const isSame = await bcrypt.compare(newPassword, account.passwordHash);
  if (isSame) {
    throw createHttpError(
      400,
      "New password must be different from the old password"
    );
  }

  // Hash new password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update and return
  const updatedAccount = await AccountModel.findByIdAndUpdate(
    account._id,
    { passwordHash },
    { new: true }
  );

  const partnerName = await getPartnerName(account._id.toString());

  return { account: updatedAccount, partnerName };
};

// change partner password
export const changePartnerPassword = async (
  identifier: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; partnerName: string }> => {
 
  const account = await authenticatePartner(identifier, oldPassword);
  if (!account) {
    return { success: false, partnerName: "" };
  }
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  await AccountModel.findByIdAndUpdate((account as any)._id, { passwordHash });
  const partnerName = await getPartnerName((account as any)._id);

  return { success: true, partnerName };
};

// verify partner suspension status
export const isPartnerSuspended = async (
  identifier: string
): Promise<boolean> => {
  // First, find the account by email or partnerId
  const account = await AccountModel.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { partnerId: identifier.toLowerCase() },
    ],
  });
  if (!account) {
    return false; // Account not found
  }

  // Return true if account.status is "disabled", else false
  return account.status === "disabled";
};

// manage tempToken
export const manageTemporaryToken = async (
  userId: string,
  action: "store" | "verify" | "clear",
  tempToken?: string
): Promise<boolean> => {
  if ((action === "store" || action === "verify") && !tempToken) {
    throw new Error("tempToken is required for store/verify");
  }

  switch (action) {
    case "store": {
      const hashedToken = await bcrypt.hash(tempToken!, 10);
      await AccountModel.findByIdAndUpdate(userId, { tempToken: hashedToken });
      return true;
    }

    case "verify": {
      const account = await AccountModel.findById(userId).select("tempToken");
      if (!account?.tempToken) return false;
      return await bcrypt.compare(tempToken!, account.tempToken);
    }

    case "clear": {
      await AccountModel.findByIdAndUpdate(userId, {
        $unset: { tempToken: "" },
      });
      return true;
    }
  }
};
