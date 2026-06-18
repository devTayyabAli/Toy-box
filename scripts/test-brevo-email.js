/**
 * Test Brevo email from .env
 * Usage: node scripts/test-brevo-email.js your@email.com
 */
require("../src/config/env");
const {
  isEmailConfigured,
  getEmailConfigIssues,
  sendOtpEmail,
  verifyEmailOnStartup,
} = require("../src/services/email.service");

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: node scripts/test-brevo-email.js recipient@example.com");
    process.exit(1);
  }

  await verifyEmailOnStartup();

  if (!isEmailConfigured()) {
    console.error("\nFix .env first:", getEmailConfigIssues().join("\n  "));
    process.exit(1);
  }

  try {
    const result = await sendOtpEmail({
      to,
      code: "123456",
      purpose: "reset_password",
      name: "Test",
    });
    console.log("\nTest email sent:", result);
  } catch (err) {
    console.error("\nSend failed:", err.message);
    process.exit(1);
  }
}

main();
