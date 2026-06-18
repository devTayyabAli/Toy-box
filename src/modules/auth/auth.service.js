const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Member } = require("../../models");
const AppError = require("../../utils/AppError");
const tokenHelper = require("../../helpers/token.helper");
const { uploadProfileImage, uploadCoverImage } = require("../../services/storage.service");
const {
  deliverMemberOtp,
  maskEmail,
  maskPhone,
} = require("../../services/otp.service");
const authRepository = require("./auth.repository");
const authFormatter = require("./auth.formatter");
const {
  formatProfile,
  loadProfileStats,
  loadBillingSummary,
  fullName: buildFullName,
  buildProfileResponse,
} = require("./profile.helper");
const {
  MEMBERSHIP_TIERS,
  mergePrivacyPatch,
  normalizePrivacySettings,
} = require("./profile.defaults");
const {
  parseFullName,
  normalizeMembershipTier,
  addMonths,
} = require("../admin/members/members.constants");

const SALT_ROUNDS = 12;
const OTP_AUTHENTICATED_PURPOSES = new Set(["change_password", "enable_2fa"]);

const INVITATION_OTP_PURPOSE = "invitation";

function generatePlaceholderPassword() {
  return crypto.randomBytes(32).toString("hex");
}

async function findMemberByInvitationOtp(code) {
  const { Op } = require("sequelize");
  const candidates = await Member.unscoped().findAll({
    where: {
      mustChangePassword: true,
      otpPurpose: INVITATION_OTP_PURPOSE,
      otpCodeHash: { [Op.ne]: null },
      otpExpiresAt: { [Op.gt]: new Date() },
    },
  });

  for (const raw of candidates) {
    const ok = await bcrypt.compare(String(code).trim(), raw.otpCodeHash);
    if (ok) return raw;
  }
  return null;
}

function issueSessionTokens(member, { updatePassword = true } = {}) {
  const accessToken = tokenHelper.generateAccessToken(member, { mfaVerified: true });
  const refreshToken = tokenHelper.generateRefreshToken(member, { mfaVerified: true });
  return authFormatter.formatSessionResponse(member, { accessToken, refreshToken }, { updatePassword });
}

function normalizeHandle(handle) {
  if (handle == null || handle === "") return null;
  let h = String(handle).trim();
  if (h.startsWith("@")) h = h.slice(1);
  return h || null;
}

function fullName(first, last, legacyName) {
  const a = [first, last].filter(Boolean).join(" ").trim();
  return a || legacyName || null;
}

async function assertValidOtp(rawMember, code, expectedPurpose) {
  if (!rawMember.otpCodeHash || rawMember.otpPurpose !== expectedPurpose) {
    throw new AppError("No OTP sent for this action. Request a new code first.", 400);
  }
  if (!rawMember.otpExpiresAt || new Date() > new Date(rawMember.otpExpiresAt)) {
    throw new AppError("OTP expired. Request a new code.", 400);
  }
  const ok = await bcrypt.compare(String(code).trim(), rawMember.otpCodeHash);
  if (!ok) {
    throw new AppError("Invalid OTP", 401);
  }
  await rawMember.update({
    otpCodeHash: null,
    otpExpiresAt: null,
    otpPurpose: null,
  });
}

async function storeAndSendOtp(memberId, purpose) {
  const raw = await Member.unscoped().findByPk(memberId);
  if (!raw) {
    throw new AppError("Member not found", 404);
  }
  const plain = String(crypto.randomInt(100000, 1000000));
  const hash = await bcrypt.hash(plain, SALT_ROUNDS);
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await raw.update({
    otpCodeHash: hash,
    otpExpiresAt: expires,
    otpPurpose: purpose,
  });
  const forDelivery = await Member.unscoped().findByPk(memberId);
  return deliverMemberOtp(forDelivery, plain, purpose);
}

const INVITABLE_ROLES = new Set(["member", "staff"]);

async function inviteUser(payload, roleName) {
  const normalizedRole = String(roleName || payload.role || "member").toLowerCase();
  if (!INVITABLE_ROLES.has(normalizedRole)) {
    throw new AppError("role must be member or staff", 400);
  }

  const email = String(payload.email).trim().toLowerCase();
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError("A user with this email already exists", 409);
  }

  const fromFullName = payload.fullName ? parseFullName(payload.fullName) : null;
  const firstName = payload.firstName || fromFullName?.firstName || null;
  const lastName = payload.lastName || fromFullName?.lastName || null;
  const legacyName = payload.name || fromFullName?.name || null;

  const displayHandle = normalizeHandle(payload.displayHandle);
  if (displayHandle) {
    const handleTaken = await authRepository.findByHandle(displayHandle);
    if (handleTaken) {
      throw new AppError("Display handle already taken", 409);
    }
  }

  const role = await authRepository.findRoleByName(normalizedRole);
  if (!role) {
    throw new AppError(`Role '${normalizedRole}' is not configured. Run database seeders.`, 500);
  }

  const placeholderPassword = generatePlaceholderPassword();
  const passwordHash = await bcrypt.hash(placeholderPassword, SALT_ROUNDS);
  const now = new Date();

  const createData = {
    email,
    password: passwordHash,
    firstName,
    lastName,
    name: fullName(firstName, lastName, legacyName),
    displayHandle: normalizedRole === "member" ? displayHandle : null,
    mobile: payload.mobile || null,
    mobileCountryCode: payload.mobileCountryCode || "+971",
    residence: payload.residence || payload.address || null,
    jobTitle: payload.jobTitle || null,
    roleId: role.id,
    twoFactorEnabled: false,
    mustChangePassword: true,
    invitedAt: now,
    invitationAcceptedAt: null,
  };

  if (normalizedRole === "member") {
    const tier = normalizeMembershipTier(
      payload.designation || payload.membershipTier || "principal",
    );
    const months = Number(payload.validityMonths) || 12;
    createData.membershipTier = tier;
    createData.membershipValidityMonths = months;
    createData.nextBillingDate = addMonths(now, months);
  }

  const user = await authRepository.createMember(createData);

  if (normalizedRole === "member") {
    const memberNumber = String(user.id).padStart(7, "0");
    await user.update({ memberNumber });
  }

  const otpDelivery = await storeAndSendOtp(user.id, INVITATION_OTP_PURPOSE);
  const fresh = await authRepository.findByPk(user.id);
  return authFormatter.formatInviteResponse(fresh, normalizedRole, otpDelivery);
}

exports.invite = async (payload) => inviteUser(payload, payload.role || "member");

exports.inviteMemberFromAdmin = async (payload) =>
  inviteUser(
    {
      role: "member",
      email: payload.email,
      fullName: payload.fullName,
      designation: payload.designation,
      validityMonths: payload.validityMonths,
      mobile: payload.mobile,
      mobileCountryCode: payload.mobileCountryCode,
      residence: payload.residence,
      displayHandle: payload.displayHandle,
    },
    "member",
  );

exports.inviteStaffFromAdmin = async (payload) =>
  inviteUser(
    {
      role: "staff",
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      jobTitle: payload.jobTitle,
      mobile: payload.mobile,
      mobileCountryCode: payload.mobileCountryCode,
    },
    "staff",
  );

exports.setupPassword = async ({ email, newPassword, confirmPassword, setupToken }) => {
  if (confirmPassword !== undefined && confirmPassword !== newPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const decoded = tokenHelper.verifyPasswordSetupToken(setupToken);
  let raw;
  if (email) {
    const normalized = String(email).trim().toLowerCase();
    raw = await authRepository.findByEmail(normalized, { withPassword: true });
  } else {
    raw = await Member.unscoped().findByPk(decoded.sub);
  }

  if (!raw || !raw.password || decoded.sub !== raw.id) {
    throw new AppError("Invalid setup session", 401);
  }
  if (!raw.mustChangePassword) {
    throw new AppError(
      "Password already set. Sign in with POST /api/v1/auth/sign-in.",
      400,
      { code: "ALREADY_ACTIVATED" },
    );
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await raw.update({
    password: hash,
    mustChangePassword: false,
    invitationAcceptedAt: new Date(),
  });

  const fresh = await authRepository.findByPk(raw.id);
  if (fresh.twoFactorEnabled) {
    return authFormatter.formatMfaPending(fresh, {
      mfaToken: tokenHelper.generateMfaPendingToken(fresh.id),
      maskedContact: maskPhone(fresh.mobile) || maskEmail(fresh.email),
      updatePassword: true,
    });
  }

  return authFormatter.formatSetupPasswordResponse(
    fresh,
    {
      accessToken: tokenHelper.generateAccessToken(fresh, { mfaVerified: true }),
      refreshToken: tokenHelper.generateRefreshToken(fresh, { mfaVerified: true }),
    },
    { message: "Password updated. Signed in successfully." },
  );
};

exports.verifyInvitationOtp = async ({ otp }) => {
  const raw = await findMemberByInvitationOtp(otp);
  if (!raw) {
    throw new AppError("Invalid or expired activation code", 401);
  }

  await assertValidOtp(raw, otp, INVITATION_OTP_PURPOSE);

  const fresh = await authRepository.findByPk(raw.id);
  return authFormatter.formatVerifyOtpResponse(
    fresh,
    tokenHelper.generatePasswordSetupToken(fresh.id),
  );
};

exports.resendInvitation = async ({ email }) => {
  const normalized = String(email).trim().toLowerCase();
  const member = await authRepository.findByEmail(normalized, { withPassword: true });
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  if (!member.mustChangePassword) {
    throw new AppError("Member has already activated their account", 400);
  }

  await member.update({ invitedAt: new Date() });
  const otpDelivery = await storeAndSendOtp(member.id, INVITATION_OTP_PURPOSE);

  return {
    invitationSent: otpDelivery.sent,
    otpSentTo: otpDelivery.destination,
    message: "A new activation code was sent to the member's email.",
  };
};

exports.signIn = async ({ email, password }) => {
  const normalized = String(email).trim().toLowerCase();
  const member = await authRepository.findByEmail(normalized, { withPassword: true });
  if (!member || !member.password) {
    throw new AppError("Invalid email or password", 401);
  }
  const match = await bcrypt.compare(password, member.password);
  if (!match) {
    throw new AppError("Invalid email or password", 401);
  }

  const fresh = await authRepository.findByPk(member.id);

  if (member.mustChangePassword) {
    return authFormatter.formatPendingActivation(
      fresh,
      tokenHelper.generatePasswordSetupToken(fresh.id),
    );
  }

  if (fresh.twoFactorEnabled) {
    return authFormatter.formatMfaPending(fresh, {
      mfaToken: tokenHelper.generateMfaPendingToken(fresh.id),
      maskedContact: maskPhone(fresh.mobile) || maskEmail(fresh.email),
    });
  }

  return issueSessionTokens(fresh, { updatePassword: true });
};

exports.refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = tokenHelper.verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
  if (decoded.typ !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }
  const id = decoded.sub ?? decoded.id;
  const member = await authRepository.findByPk(id);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  if (member.mustChangePassword) {
    throw new AppError(
      "Complete password setup before refreshing tokens.",
      403,
      { code: "PASSWORD_SETUP_REQUIRED" },
    );
  }
  if (member.twoFactorEnabled && decoded.mfa !== true) {
    throw new AppError("Complete two-factor sign-in before refreshing this session.", 403);
  }
  const mfaVerified = !member.twoFactorEnabled || decoded.mfa === true;
  return {
    accessToken: tokenHelper.generateAccessToken(member, { mfaVerified }),
    refreshToken: tokenHelper.generateRefreshToken(member, { mfaVerified }),
  };
};

exports.sendOtp = async ({ mfaToken, purpose }, authMemberId) => {
  if (purpose === "login") {
    if (!mfaToken) {
      throw new AppError("mfaToken is required for login OTP", 400);
    }
    const dec = tokenHelper.verifyMfaPendingToken(mfaToken);
    const raw = await authRepository.findUnscopedByPk(dec.sub);
    if (!raw || !raw.twoFactorEnabled) {
      throw new AppError("Invalid MFA flow", 400);
    }
    const delivery = await storeAndSendOtp(raw.id, "login");
    return { sent: delivery.sent, purpose: "login", channel: delivery.channel, destination: delivery.destination };
  }

  if (!purpose || !OTP_AUTHENTICATED_PURPOSES.has(purpose)) {
    throw new AppError("Invalid purpose for authenticated OTP", 400);
  }
  if (!authMemberId) {
    throw new AppError("Authentication required", 401);
  }

  const raw = await authRepository.findUnscopedByPk(authMemberId);

  if (purpose === "enable_2fa") {
    if (raw.twoFactorEnabled) {
      throw new AppError("Two-factor authentication is already enabled", 400);
    }
    const delivery = await storeAndSendOtp(raw.id, "enable_2fa");
    return {
      sent: delivery.sent,
      purpose: "enable_2fa",
      channel: delivery.channel,
      destination: delivery.destination,
    };
  }

  if (purpose === "change_password") {
    if (!raw.twoFactorEnabled) {
      throw new AppError(
        "Two-factor is not enabled on this account. Change password without OTP, or enable 2FA first.",
        400,
      );
    }
    const delivery = await storeAndSendOtp(raw.id, "change_password");
    return {
      sent: delivery.sent,
      purpose: "change_password",
      channel: delivery.channel,
      destination: delivery.destination,
    };
  }
};

exports.verifyLogin2fa = async ({ mfaToken, code }) => {
  const dec = tokenHelper.verifyMfaPendingToken(mfaToken);
  const raw = await authRepository.findUnscopedByPk(dec.sub);
  if (!raw || !raw.twoFactorEnabled) {
    throw new AppError("Invalid MFA flow", 400);
  }
  await assertValidOtp(raw, code, "login");
  const fresh = await authRepository.findByPk(dec.sub);
  return {
    ...issueSessionTokens(fresh, { updatePassword: true }),
    authenticated: true,
    mfaVerified: true,
  };
};

exports.verifyEnable2fa = async (memberId, code) => {
  const raw = await authRepository.findUnscopedByPk(memberId);
  if (!raw) {
    throw new AppError("Member not found", 404);
  }
  if (raw.twoFactorEnabled) {
    throw new AppError("Two-factor is already enabled", 400);
  }
  await assertValidOtp(raw, code, "enable_2fa");
  await raw.update({ twoFactorEnabled: true });
  const fresh = await authRepository.findByPk(memberId);
  return {
    authenticated: true,
    mfaVerified: true,
    twoFactorEnabled: true,
    member: fresh.toPublicJSON(),
    accessToken: tokenHelper.generateAccessToken(fresh, { mfaVerified: true }),
    refreshToken: tokenHelper.generateRefreshToken(fresh, { mfaVerified: true }),
  };
};

exports.changePassword = async (memberId, { oldPassword, newPassword, otp }) => {
  const raw = await authRepository.findUnscopedByPk(memberId);
  if (!raw || !raw.password) {
    throw new AppError("Password login is not available for this account", 400);
  }
  const okOld = await bcrypt.compare(oldPassword, raw.password);
  if (!okOld) {
    throw new AppError("Current password is incorrect", 401);
  }
  if (raw.twoFactorEnabled) {
    if (!otp) {
      throw new AppError(
        "OTP required. POST /api/v1/auth/2fa/send-otp with { \"purpose\": \"change_password\" } first.",
        400,
      );
    }
    await assertValidOtp(raw, otp, "change_password");
  }
  const next = await authRepository.findUnscopedByPk(memberId);
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await next.update({ password: hash });
  const fresh = await authRepository.findByPk(memberId);
  return { member: fresh.toPublicJSON(), message: "Password updated" };
};

async function buildProfileResponseForMember(memberId) {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  return buildProfileResponse(member);
}

exports.getProfile = async (memberId) => buildProfileResponseForMember(memberId);

exports.getProfileBilling = async (memberId) => {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  return loadBillingSummary(memberId, member);
};

exports.getProfilePrivacy = async (memberId) => {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  return {
    twoFactorEnabled: Boolean(member.twoFactorEnabled),
    ...normalizePrivacySettings(member.privacySettings),
  };
};

exports.updateProfilePrivacy = async (memberId, patch) => {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  const next = mergePrivacyPatch(member.privacySettings, patch);
  await member.update({ privacySettings: next });
  return exports.getProfilePrivacy(memberId);
};

exports.getProfileSessions = async (memberId, req = {}) => {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  const userAgent = req.headers?.["user-agent"] || "Unknown device";
  return {
    sessions: [
      {
        id: "current",
        deviceName: userAgent.length > 80 ? `${userAgent.slice(0, 77)}...` : userAgent,
        location: "",
        isCurrentDevice: true,
        lastActiveAt: new Date().toISOString(),
      },
    ],
  };
};

exports.listMembershipTiers = () => ({
  tiers: Object.values(MEMBERSHIP_TIERS),
});

exports.updateProfile = async (memberId, payload) => {
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }

  const nextHandle = payload.displayHandle !== undefined
    ? normalizeHandle(payload.displayHandle)
    : undefined;

  if (nextHandle !== undefined && nextHandle !== member.displayHandle) {
    if (nextHandle) {
      const taken = await authRepository.findByHandle(nextHandle);
      if (taken && taken.id !== member.id) {
        throw new AppError("Display handle already taken", 409);
      }
    }
  }

  const updates = {};
  if (payload.firstName !== undefined) updates.firstName = payload.firstName || null;
  if (payload.lastName !== undefined) updates.lastName = payload.lastName || null;
  if (payload.mobile !== undefined) updates.mobile = payload.mobile || null;
  if (payload.residence !== undefined) updates.residence = payload.residence || null;
  if (payload.address !== undefined) updates.residence = payload.address || null;
  if (payload.jobTitle !== undefined) updates.jobTitle = payload.jobTitle || null;
  if (payload.mobileCountryCode !== undefined) {
    updates.mobileCountryCode = payload.mobileCountryCode || null;
  }
  if (payload.coverImageUrl !== undefined) {
    updates.coverImageUrl = payload.coverImageUrl || null;
  }
  if (nextHandle !== undefined) updates.displayHandle = nextHandle;

  if (payload.email !== undefined) {
    const normalized = String(payload.email).trim().toLowerCase();
    if (normalized !== member.email) {
      const existing = await authRepository.findByEmail(normalized);
      if (existing && existing.id !== member.id) {
        throw new AppError("Email already in use", 409);
      }
      updates.email = normalized;
    }
  }

  if (payload.name !== undefined) {
    updates.name = payload.name || null;
  } else if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const f = payload.firstName !== undefined ? payload.firstName : member.firstName;
    const l = payload.lastName !== undefined ? payload.lastName : member.lastName;
    updates.name = buildFullName(f, l, null);
  }

  await member.update(updates);
  return buildProfileResponseForMember(member.id);
};

exports.forgotPassword = async ({ email }) => {
  const normalized = String(email).trim().toLowerCase();
  const member = await authRepository.findByEmail(normalized, { withPassword: true });
  const genericMessage =
    "If an account exists for this email, a reset code has been sent.";

  if (!member) {
    return { message: genericMessage };
  }

  const delivery = await storeAndSendOtp(member.id, "reset_password");
  return {
    message: genericMessage,
    ...(delivery.sent && {
      channel: delivery.channel,
      maskedContact: delivery.destination,
    }),
  };
};

exports.resetPassword = async ({ email, code, newPassword }) => {
  const normalized = String(email).trim().toLowerCase();
  const raw = await authRepository.findByEmail(normalized, { withPassword: true });
  if (!raw) {
    throw new AppError("Invalid email or code", 400);
  }
  await assertValidOtp(raw, code, "reset_password");
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await raw.update({ password: hash });
  return { message: "Password reset successfully. You can sign in with your new password." };
};

exports.updateProfilePhoto = async (memberId, file) => {
  if (!file?.buffer?.length) {
    throw new AppError("Image file is required", 400);
  }
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  const { url } = await uploadProfileImage({
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalName: file.originalname,
  });
  await member.update({ profileImageUrl: url });
  return buildProfileResponseForMember(member.id);
};

exports.updateCoverImage = async (memberId, file) => {
  if (!file?.buffer?.length) {
    throw new AppError("Cover image file is required", 400);
  }
  const member = await authRepository.findByPk(memberId);
  if (!member) {
    throw new AppError("Member not found", 404);
  }
  const { url } = await uploadCoverImage({
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalName: file.originalname,
  });
  await member.update({ coverImageUrl: url });
  return buildProfileResponseForMember(member.id);
};
