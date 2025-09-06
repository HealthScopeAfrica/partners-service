export const profileCreationMail = (orgName?: string) => {
  return `
<!DOCTYPE html>
<!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
    <div style="max-width: 420px; margin: 80px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
      <h2 style="margin-top: 0;">We’ve Received Your Application
</h2>
      <p style="color: #222;">Hi${orgName ? ` ${orgName}` : ""},</p>
      <p style="color: #222;">
               Thank you for submitting your application to join the HealthScope Partner Network. 
        We’re excited and wanted to let you know that we’ve received your profile successfully.
      </p>
      <p style="color: #222;">
       Our team is currently reviewing it. You can expect to hear from us with next steps within <b>1-2 working days</b>.
      </p>
      <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #2e7d32; font-size: 14px;">
        <p style="margin: 0; color: #222;">
          If you have any questions in the meantime, please reach us at
          <a href="mailto:partnerships@healthscope.africa" style="color:#2e7d32; text-decoration:none;">partnerships@healthscope.africa</a>.
        </p>
      </div>
      <p style="margin-top: 32px; font-size: 13px; color: #888;">
        Thank you,  
        <br />
        The HealthScope Team
      </p>
    </div>
  </body>
</html>
  `;
};
