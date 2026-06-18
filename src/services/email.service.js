const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
const { renderOtpEmail } = require("./email/otpEmail.template");

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function isBrevoApiConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.SMTP_FROM_EMAIL);
}

function isBrevoIpBlockedError(err) {
  const msg = String(err?.message || err || "");
  return /unauthorized ip|unrecognised ip|5\.7\.1|authorised_ips/i.test(msg);
}

function printBrevoIpHelp(err) {
  const msg = String(err?.message || err || "");
  const ipMatch = msg.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  const ipLine = ipMatch ? `  → Whitelist this IP: ${ipMatch[1]}\n` : "";

  console.error(
    "\n[Brevo] Your IP is not authorized for SMTP or API\n" +
      ipLine +
      "  Fix: https://app.brevo.com/security/authorised_ips\n" +
      "  Also: SMTP & API → Authorized IPs (if SMTP still used)\n" +
      "  Or disable IP restriction in Brevo Security settings for dev\n",
  );
}

function isEmailConfigured() {
  return isSmtpConfigured() || isBrevoApiConfigured();
}

function getSender() {
  return {
    name: process.env.SMTP_FROM_NAME || "Toy-Box",
    email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
  };
}

let transporter;

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendViaBrevoApi({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = getSender();
  if (!apiKey || !sender.email) {
    return null;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API ${res.status}: ${body}`);
  }

  const data = await res.json();
  logger.info(`[email] Brevo API messageId=${data.messageId} to=${to}`);
  return { sent: true, messageId: data.messageId, provider: "brevo_api" };
}

async function sendViaSmtp({ to, subject, text, html }) {
  const transport = getTransporter();
  if (!transport) {
    return null;
  }

  const sender = getSender();
  const info = await transport.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    subject,
    text,
    html,
  });

  logger.info(`[email] SMTP messageId=${info.messageId} to=${to}`);
  return { sent: true, messageId: info.messageId, provider: "smtp" };
}

async function sendMail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "email_not_configured" };
  }

  if (!getSender().email) {
    throw new Error("SMTP_FROM_EMAIL is required (verified sender in Brevo)");
  }

  let lastError;
  if (isBrevoApiConfigured()) {
    try {
      return await sendViaBrevoApi({ to, subject, text, html });
    } catch (err) {
      lastError = err;
      logger.error(`[email] Brevo API failed: ${err.message}`);
      if (isBrevoIpBlockedError(err)) {
        printBrevoIpHelp(err);
      }
    }
  }

  if (isSmtpConfigured()) {
    try {
      return await sendViaSmtp({ to, subject, text, html });
    } catch (err) {
      lastError = err;
      logger.error(`[email] SMTP failed: ${err.message}`);
      if (isBrevoIpBlockedError(err) && !isBrevoApiConfigured()) {
        printBrevoIpHelp(err);
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return { sent: false, reason: "send_failed" };
}

async function sendOtpEmail({ to, code, purpose, name }) {
  const { subject, text, html } = renderOtpEmail({ code, purpose, name });
  return sendMail({ to, subject, text, html });
}

async function sendInvitationEmail({ to, temporaryPassword, name }) {
  const { renderInvitationEmail } = require("./email/invitationEmail.template");
  const { subject, text, html } = renderInvitationEmail({
    email: to,
    temporaryPassword,
    name,
  });
  return sendMail({ to, subject, text, html });
}

function getEmailConfigIssues() {
  const issues = [];
  if (!process.env.SMTP_HOST) issues.push("SMTP_HOST is missing");
  if (!process.env.SMTP_USER) issues.push("SMTP_USER is missing");
  if (!process.env.SMTP_PASS) issues.push("SMTP_PASS is empty — paste your xsmtpsib- key from Brevo");
  if (!process.env.SMTP_FROM_EMAIL) {
    issues.push(
      "SMTP_FROM_EMAIL is empty — use a verified sender email in Brevo (Senders & Domains)",
    );
  }
  if (!isSmtpConfigured() && !process.env.BREVO_API_KEY) {
    issues.push("(optional) BREVO_API_KEY for HTTP API instead of SMTP");
  }
  if (process.env.BREVO_API_KEY && !process.env.SMTP_FROM_EMAIL) {
    issues.push("BREVO_API_KEY set but SMTP_FROM_EMAIL still required as sender address");
  }
  return issues;
}

function logEmailConfigStatus() {
  const sender = getSender();
  const issues = getEmailConfigIssues();

  if (!isEmailConfigured()) {
    console.warn(
      "\n[email] OTP emails NOT configured — edit .env in project root (d:\\vehical_booking_system\\toy-box\\.env):\n" +
        issues.map((i) => `  - ${i}`).join("\n") +
        "\n  Code files: src/services/email.service.js, src/services/otp.service.js\n" +
        "  Until fixed, OTP prints in this terminal when you call forgot-password (OTP_LOG_CODE=true).\n",
    );
    return;
  }

  const via = [
    isBrevoApiConfigured() ? "Brevo API" : null,
    isSmtpConfigured() ? "SMTP" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  console.log(`[email] OTP enabled (${via}) from <${sender.email}>`);
}

async function verifyBrevoApiOnStartup() {
  const res = await fetch("https://api.brevo.com/v3/account", {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API ${res.status}: ${body}`);
  }
  console.log("[email] Brevo API connection verified OK");
}

async function verifySmtpOnStartup() {
  const transport = getTransporter();
  await transport.verify();
  console.log("[email] Brevo SMTP connection verified OK");
}

async function verifyEmailOnStartup() {
  logEmailConfigStatus();
  if (!isEmailConfigured()) {
    return;
  }

  if (isBrevoApiConfigured()) {
    try {
      await verifyBrevoApiOnStartup();
    } catch (err) {
      console.error(`[email] Brevo API verify FAILED: ${err.message}`);
      if (isBrevoIpBlockedError(err)) {
        printBrevoIpHelp(err);
      } else {
        console.error("  → Check BREVO_API_KEY and SMTP_FROM_EMAIL in .env\n");
      }
    }
    if (process.env.EMAIL_VERIFY_SMTP_ON_STARTUP !== "true") {
      return;
    }
  }

  if (!isSmtpConfigured()) {
    return;
  }

  try {
    await verifySmtpOnStartup();
  } catch (err) {
    console.error(`[email] Brevo SMTP verify FAILED: ${err.message}`);
    if (isBrevoIpBlockedError(err)) {
      printBrevoIpHelp(err);
    } else {
      console.error("  → Check SMTP_PASS (xsmtpsib key) and SMTP_FROM_EMAIL in .env\n");
    }
  }
}

module.exports = {
  isSmtpConfigured,
  isBrevoApiConfigured,
  isEmailConfigured,
  isBrevoIpBlockedError,
  sendMail,
  sendOtpEmail,
  sendInvitationEmail,
  logEmailConfigStatus,
  verifyEmailOnStartup,
  getEmailConfigIssues,
  printBrevoIpHelp,
};
