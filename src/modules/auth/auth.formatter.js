"use strict";

function resolveRole(member) {
  return String(member?.role?.name || member?.role || "member").toLowerCase();
}

function roleProfile(member) {
  const user = member.toPublicJSON();
  const role = resolveRole(member);
  const base = { role, user, accountStatus: user.accountStatus };

  if (role === "admin") {
    return {
      ...base,
      panel: "admin",
      capabilities: ["inventory", "sourcing", "invitations", "chat"],
    };
  }

  if (role === "staff") {
    return {
      ...base,
      panel: "staff",
      jobTitle: user.jobTitle || null,
    };
  }

  return {
    ...base,
    panel: "member",
    membershipTier: user.membershipTier || null,
    memberNumber: user.memberNumber || null,
  };
}

exports.resolveRole = resolveRole;
exports.roleProfile = roleProfile;

exports.formatSessionResponse = (member, tokens, { updatePassword = true } = {}) => ({
  authenticated: true,
  updatePassword,
  ...roleProfile(member),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

exports.formatPendingActivation = (member, setupToken) => ({
  authenticated: false,
  setupRequired: true,
  updatePassword: false,
  setupToken,
  ...roleProfile(member),
  message:
    "Account not activated. Verify your invitation OTP via POST /api/v1/auth/invitations/verify-otp, then set a password.",
});

exports.formatMfaPending = (member, { mfaToken, maskedContact, updatePassword = true }) => ({
  authenticated: false,
  mfaRequired: true,
  updatePassword,
  mfaToken,
  maskedContact,
  ...roleProfile(member),
  message:
    "Two-factor authentication required. POST /api/v1/auth/2fa/send-otp with purpose login, then POST /api/v1/auth/2fa/verify-login.",
});

exports.formatVerifyOtpResponse = (member, setupToken) => ({
  ...roleProfile(member),
  setupToken,
  nextStep: "POST /api/v1/auth/setup-password",
  message: "Activation code accepted. Set your password via POST /api/v1/auth/setup-password.",
});

exports.formatSetupPasswordResponse = (member, tokens, { message } = {}) => ({
  ...exports.formatSessionResponse(member, tokens, { updatePassword: true }),
  message: message || "Password updated. Signed in successfully.",
});

exports.formatInviteResponse = (member, roleName, otpDelivery) => ({
  role: roleName,
  ...roleProfile(member),
  invitationSent: otpDelivery.sent,
  otpSentTo: otpDelivery.destination,
  membershipTier: member.membershipTier || null,
  membershipValidityMonths: member.membershipValidityMonths || null,
  membershipValidUntil: member.nextBillingDate || null,
  message: `Invitation sent. A one-time activation code was emailed to the ${roleName}.`,
});
