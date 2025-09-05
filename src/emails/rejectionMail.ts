export const rejectionMail = (orgName?: string) => {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
    <div style="max-width: 420px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
      <h2 style=" margin-top: 0;">Partner Application Update</h2>
      <p style="color: #222;">Hi${orgName ? ` ${orgName}` : ''},</p>
      <p style="color: #222;">We appreciate your interest in becoming a HealthScope Partner. Unfortunately, your application was <b style='color:#c62828;'>not approved</b> at this time.</p>
      <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #c62828; font-size:14px;">
        <p style="margin: 0; color: #222;">If you have questions or wish to reapply, You can contact us at partnerships@healthscope.africa</p>
      </div>
      <p style="margin-top: 32px; font-size: 13px; color: #888;">Thank you .</p>
    </div>
  </body>
</html>
  `;
};
