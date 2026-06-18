const OTP_PURPOSE_COPY = {
  login: {
    headline: "Your sign-in code",
    lead: "Use the code below to sign in to your Toy-Box account.",
    action: "Sign in",
  },
  enable_2fa: {
    headline: "Enable two-factor authentication",
    lead: "Enter this code to turn on two-factor authentication for your account.",
    action: "Verify",
  },
  change_password: {
    headline: "Confirm your password change",
    lead: "Enter this code to confirm you want to change your password.",
    action: "Confirm",
  },
  reset_password: {
    headline: "Reset your password",
    lead: "You requested a password reset. Enter this code in the app to choose a new password.",
    action: "Reset password",
  },
  invitation: {
    headline: "Welcome — activate your account",
    lead: "You've been invited to join Toy-Box. Enter this one-time code in the app to set your password.",
    action: "Activate account",
  },
};

const DEFAULT_COPY = {
  headline: "Your verification code",
  lead: "Use the code below to complete your request.",
  action: "Verify",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPurposeCopy(purpose) {
  return OTP_PURPOSE_COPY[purpose] || DEFAULT_COPY;
}

function getAppName() {
  return process.env.SMTP_FROM_NAME || "Toy-Box";
}

function getSupportUrl() {
  const base = String(process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
  return base || null;
}

/**
 * @returns {{ subject: string, text: string, html: string }}
 */
function renderOtpEmail({ code, purpose, name }) {
  const appName = getAppName();
  const copy = getPurposeCopy(purpose);
  const safeCode = escapeHtml(code);
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const supportUrl = getSupportUrl();
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

  const subjects = {
    login: `Your ${appName} sign-in code`,
    enable_2fa: `Enable two-factor authentication — ${appName}`,
    change_password: `Confirm your password change — ${appName}`,
    reset_password: `Reset your ${appName} password`,
    invitation: `You're invited to ${appName} — your activation code`,
  };
  const subject = subjects[purpose] || `Your ${appName} verification code`;

  const textName = name || "there";
  const text = [
    `Hi ${textName},`,
    "",
    copy.lead,
    "",
    `Your verification code: ${code}`,
    "",
    `This code expires in ${expiryMinutes} minutes.`,
    "",
    "If you did not request this, you can safely ignore this email.",
    "",
    `— ${appName}`,
    supportUrl ? `\n${supportUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const footerLink = supportUrl
    ? `<a href="${escapeHtml(supportUrl)}" style="color:#c9a227;text-decoration:none;">Open ${escapeHtml(appName)}</a>`
    : escapeHtml(appName);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef0f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#eef0f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a227;font-weight:600;">${escapeHtml(appName)}</p>
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">${escapeHtml(copy.headline)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">${greeting}</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#64748b;">${escapeHtml(copy.lead)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:28px 24px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;font-weight:600;">Verification code</p>
                    <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a;font-family:'Courier New',Courier,monospace;">${safeCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#64748b;text-align:center;">
                Expires in <strong style="color:#0f172a;">${expiryMinutes} minutes</strong>
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;text-align:center;">
                If you did not request this, you can safely ignore this email. Your password will not change unless you enter this code in the app.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">${footerLink}</p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ${escapeHtml(appName)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

module.exports = {
  renderOtpEmail,
  escapeHtml,
  getPurposeCopy,
};
