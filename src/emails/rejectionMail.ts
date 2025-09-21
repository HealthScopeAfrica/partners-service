export const rejectionMail = (orgName?: string) => {
  return `
    <!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
    <div style="max-width: 420px; margin: 80px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
      <h2 style="margin-top: 0;">A Note from the HealthScope Team</h2>
      <p style="color: #222;">Hi${orgName ? ` ${orgName}` : ""},</p>
      <p style="color: #222;">
        Thank you for your interest in joining the HealthScope Partner Network. 
        After a careful review, we’re unable to move forward with your application at this time.
      </p>
     
      <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #c62828; font-size: 14px;">
        <p style="margin: 0; color: #222;">
          If you’d like guidance or wish to reapply, please reach us at 
          <a href="mailto:partnerships@healthscope.africa" style="color:#2e7d32; text-decoration:none;">partnerships@healthscope.africa</a>.
        </p>
      </div>
      <p style="margin-top: 32px; font-size: 13px; color: #888;">
       Thank you
       <br />
       The HealthScope Team
       </p>
    </div>
  </body>
</html>
  `;
};
