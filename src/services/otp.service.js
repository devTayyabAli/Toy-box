const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  isEmailConfigured,
  sendOtpEmail,
  isBrevoIpBlockedError,
  printBrevoIpHelp,
} = require("./email.service");
const { formatMemberDisplayName } = require("./email/memberName");

function maskEmail(email) {
  if (!email || typeof email !== "string") return null;
  const [u, domain] = email.split("@");
  if (!domain) return "***";
  const safe = u.length <= 2 ? "*" : `${u[0]}***${u[u.length - 1]}`;
  return `${safe}@${domain}`;
}

function maskPhone(mobile) {
  if (!mobile || typeof mobile !== "string") return null;
  const d = mobile.replace(/\s/g, "");
  if (d.length < 4) return "****";
  return `****${d.slice(-4)}`;
}

function shouldLogOtpToConsole() {
  return process.env.NODE_ENV !== "production" || process.env.OTP_LOG_CODE === "true";
}

function logOtpToConsole({ purpose, member, plainCode, emailSent }) {
  if (!shouldLogOtpToConsole()) {
    return;
  }
  const target = member.email || member.mobile || `memberId=${member.id}`;
  console.log(
    `\n========== OTP (${purpose}) ==========\n` +
      `  To: ${target}\n` +
      `  Code: ${plainCode}\n` +
      `  Email sent: ${emailSent ? "yes" : "no — configure .env SMTP or BREVO_API_KEY"}\n` +
      `======================================\n`,
  );
}

/**
 * Delivers OTP via Brevo (API or SMTP). In development, always prints code to server console.
 */
async function deliverMemberOtp(member, plainCode, purpose) {
  const memberId = member.id;
  let emailSent = false;

  if (member.email && isEmailConfigured()) {
    try {
      await sendOtpEmail({
        to: member.email,
        code: plainCode,
        purpose,
        name: formatMemberDisplayName(member),
      });
      emailSent = true;
      logger.info(
        `[OTP] sent via email purpose=${purpose} to=${maskEmail(member.email)} memberId=${memberId}`,
      );
    } catch (err) {
      logger.error(`[OTP] email delivery failed: ${err.message}`);
      if (isBrevoIpBlockedError(err)) {
        printBrevoIpHelp();
      }
      logOtpToConsole({ purpose, member, plainCode, emailSent: false });

      const allowConsoleFallback =
        process.env.NODE_ENV !== "production" ||
        process.env.OTP_ALLOW_CONSOLE_FALLBACK === "true";

      if (allowConsoleFallback) {
        return {
          sent: false,
          channel: "email",
          destination: maskEmail(member.email),
          emailConfigured: true,
          brevoIpBlocked: isBrevoIpBlockedError(err),
        };
      }

      throw new AppError(
        `Could not send OTP email: ${err.message}. Check Brevo authorized IPs or BREVO_API_KEY in .env.`,
        502,
      );
    }
  } else if (!isEmailConfigured()) {
    logger.warn("[OTP] Email not configured — set SMTP_* or BREVO_API_KEY in .env");
  } else if (!member.email) {
    logger.warn(`[OTP] Member ${memberId} has no email on file`);
  }

  logOtpToConsole({ purpose, member, plainCode, emailSent });

  return {
    sent: emailSent,
    channel: member.email ? "email" : member.mobile ? "sms" : "none",
    destination: member.email
      ? maskEmail(member.email)
      : maskPhone(member.mobile),
    emailConfigured: isEmailConfigured(),
  };
}

module.exports = {
  deliverMemberOtp,
  maskEmail,
  maskPhone,
  isEmailConfigured,
  logOtpToConsole,
};
