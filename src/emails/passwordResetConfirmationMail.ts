// partnerPasswordResetRequestMail.ts
// Generates the HTML for partner password reset request email

export function passwordResetConfirmationMail(
  partnerName: string,
  resetLink: string,
  expiryMinutes: string
): string {
  return `
    <html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
  <div style="max-width: 420px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
    <h2 style="margin-top: 0;">Reset Your Password</h2>

    <p style="color: #222;">Hi ${partnerName ? ` ${partnerName}` : ""},</p>

    <p style="color: #222;">
      We received a request to reset your account password. To proceed, please confirm the request by clicking the button below:
    </p>

        <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #00b894;">
          <a href="${resetLink}" 
             style="display: inline-block; background: #00b894; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
            Confirm & Reset Password
          </a>
        </div>

    <p style="color: #222;">This link will remain valid for the next ${expiryMinutes} minutes.</p>

    <p style="color: #222;">
      Didn’t request a password reset? Please 
      <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #00b894; text-decoration: none; font-weight: 500;">contact our support team</a>
      immediately so we can investigate.
    </p>

    <p style="margin-top: 32px; font-size: 13px; color: #888;">
      Thank you,<br />
      The HealthScope Team
    </p>
  </div>
</body>
</html>`;
}
