export const approvalMail = (orgName?: string, partnerId?: string, password?: string) => {
  return `
  Put your HTML text here  <!DOCTYPE html>
<html>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5fff9; color: #222; margin: 0; padding: 0;">
    <div style="max-width: 420px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
      <h2 style=" margin-top: 0;">Welcome Onboard Partner!</h2>
      <p style="color: #222;">Hi${orgName ? ` ${orgName}` : ''},</p>
      <p style="color: #222;">Your partner account has been <b style='color:#00b894;'>approved</b>! You can now log in and start using our platform.</p>
      <div style="background: #f5fff9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #00b894;">
        <p style="margin: 0 0 8px 0; color: #222;"><b>Login Credentials:</b></p>
        <p style="margin: 0; color: #222;">Partner ID: <b >${partnerId}</b></p>
        <p style="margin: 0; color: #222;">Password: <b >${password}</b></p>
      </div>
      <a href="https://your-app-url.com/login" style="display: inline-block; background: #00b894; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">Log In</a>
      <p style="margin-top: 24px; color: #222;">For your security, please change your password after your first login.</p>
      <p style="margin-top: 32px; font-size: 13px; color: #888;">If you have any questions, reply to this email.</p>
    </div>
  </body>
</html>
  `;
};
