export const verfiyAccountTemplate = (verifyURL) => {
  return `
  <body style="font-family: Arial, sans-serif; color: #555; background: #fff; font-size: 16px; line-height: 24px; margin: 0; padding: 0;">
  <table align="center" width="600" style="margin: auto; border: 1px solid #eee; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px; text-align: center; border-bottom: 4px solid #00a5b5;">
        <img src="https://info.tenable.com/rs/tenable/images/tenable-white-email.png" width="200" alt="Logo"/>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px; color: #333;">Confirmation Email</h2>
        <p style="margin: 10px 0; font-size: 16px; color: #555;">
          Hello, please confirm your email to continue.
        </p>
        <a href="${verifyURL}" 
           style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: #ff8300; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify Now
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </td>
    </tr>
  </table>
</body>
    `;
};

// Reset password email template
export const resetPasswordTemplate = (resetURL) => {
  return `
   <body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
    <table class="main contenttable" align="center">
      <tr>
        <td>
          
          <td class="grey-block" style="text-align:center;">
            <div class="mktEditable" id="cta">
                <p>Forgot your password? click reset password button request to set your new password.</p>
                <p>Your password reset token (valid for 10 min)</p>
                <p>If you didn't forget your password, please ignore this email!</p><br><hr>
              <img class="top-image" src="https://info.tenable.com/rs/tenable/images/webinar-no-text.png" width="560"/><br><br>
              <a style="color:#ffffff; background-color: #ff8300; border: 10px solid #ff8300; border-radius: 3px; text-decoration:none;"
                 href="${resetURL}">
                 Reset Password
              </a>
            </div>
          </td>
          ...
        </td>
      </tr>
    </table>
  </body>`;
};