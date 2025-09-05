/**
 * UTILITY FUNCTIONS
 *
 * Reusable helper functions used across the application
 */

import { AccountModel } from "../models/users/account.model";
import { Resend } from "resend";
// import AWS from 'aws-sdk'; // Uncomment when ready for SES
import dotenv from "dotenv";
import createHttpError from "http-errors";
dotenv.config();

/**
 * Generate unique partner ID with format: PTR-XXXXXXXXX
 *
 * SCALABLE APPROACH: Uses timestamp + random for guaranteed uniqueness
 * - Timestamp (base36): Ensures chronological ordering and reduces collisions
 * - Random suffix: Adds entropy for multiple requests at same millisecond
 *
 * SECURITY: Uses generic prefix to avoid exposing organization names
 * FORMAT: PTR- + timestamp(base36) + 3 random characters
 * EXAMPLE: PTR-L7K9M3ABC, PTR-L7K9M3XYZ
 *
 * PERFORMANCE: Extremely low collision rate, single DB query for verification
 * CAPACITY: Virtually unlimited (timestamp ensures uniqueness over time)
 */
export const generatePartnerId = async (): Promise<string> => {
  // Use timestamp + random for guaranteed uniqueness
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const random = Math.random().toString(36).substring(2, 5); // 3 random chars
  const partnerId = `PTR-${timestamp}${random}`.toUpperCase();

  // Check if this partnerId already exists
  const existingAccount = await AccountModel.findOne({ partnerId });
  const isUnique = !existingAccount;

  return isUnique ? partnerId : generatePartnerId(); // Retry if not unique
};

/**
 * Generate secure random password
 *
 * Creates a strong password for partner accounts
 * Contains: uppercase, lowercase, numbers, and special characters
 */
export const generateSecurePassword = (): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*";

  // Ensure at least one character from each set
  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));

  // Fill remaining 8 characters randomly
  const allChars = uppercase + lowercase + numbers + specials;
  for (let i = 4; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password to randomize position of required characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Send an email using Resend (for non-production) or AWS SES (for production)
 * @param subject - Email subject
 * @param content - Email HTML content
 * @param recipient - Recipient email address
 */
export async function sendEmail(
  subject: string,
  body: string,
  recipient: string
): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    // TODO: Implement AWS SES logic here when ready
    // Example stub:
    // const ses = new AWS.SES({ region: 'us-east-1' });
    // await ses.sendEmail({ ... }).promise();
    throw createHttpError(501, "AWS SES integration not yet implemented.");
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_BOX as string,
      to: recipient,
      subject,
      html: body,
    });

    if (error) {
      throw createHttpError(500, error.message || "Failed to send email");
    }

    console.log({ data });
  }
}
