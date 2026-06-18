"use strict";

function renderInvitationEmail({ email, temporaryPassword, name, appName }) {
  const brand = appName || process.env.SMTP_FROM_NAME || "Toy-Box";
  const subject = `You're invited to ${brand}`;

  const greeting = name ? `Hi ${name},` : "Hi,";
  const text =
    `${greeting}\n\n` +
    `You've been invited to join ${brand}.\n\n` +
    `Sign in with:\n` +
    `  Username (email): ${email}\n` +
    `  Temporary password: ${temporaryPassword}\n\n` +
    `Open the app, sign in with your temporary password, then set a new password when prompted.\n\n` +
    `If you did not expect this invitation, you can ignore this email.`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
  <p>${greeting}</p>
  <p>You've been invited to join <strong>${brand}</strong>.</p>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Username</strong></td><td>${email}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Temporary password</strong></td><td><code>${temporaryPassword}</code></td></tr>
  </table>
  <p>Open the app, sign in with your temporary password, then choose a new password on the next screen.</p>
  <p style="color: #666; font-size: 12px;">If you did not expect this invitation, you can ignore this email.</p>
</body>
</html>`;

  return { subject, text, html };
}

module.exports = { renderInvitationEmail };
