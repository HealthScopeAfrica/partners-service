// passwordResetSuccessMail.ts
// Generates the HTML for password reset success email

export function passwordResetSuccessMail(partnerName: string, newPassword: string): string {
  return `
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
  <div style="max-width: 420px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
    <h2 style="margin-top: 0; color: #00b894;">Password Reset Successful</h2>

    <p style="color: #222;">Hi${partnerName ? ` ${partnerName}` : ''},</p>

    <p style="color: #222;">
      Your password has been successfully reset for your HealthScope Partner account.
    </p>

    <p style="color: #222;">
      You can now log in with your new password.
    </p>
        <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #00b894;">

    <p style="color: #222;">
      If you did not initiate this password reset, please 
      <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #00b894; text-decoration: none; font-weight: 500;">
        contact our support team
      </a> immediately so we can investigate.
    </p>
    </div>

    <p style="margin-top: 32px; font-size: 13px; color: #888;">
      Thank you,  
      <br />
      The HealthScope Team
    </p>
  </div>
</body>
  `;
}
