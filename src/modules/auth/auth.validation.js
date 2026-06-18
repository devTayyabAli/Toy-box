const Joi = require("joi");

const handle = Joi.string().trim().max(50).optional().allow(null, "");

const validityMonths = Joi.number().integer().valid(6, 12, 24, 36);

exports.signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.inviteSchema = Joi.object({
  role: Joi.string().valid("member", "staff").default("member"),
  email: Joi.string().email().required(),
  fullName: Joi.string().trim().max(200).optional().allow(null, ""),
  firstName: Joi.string().trim().max(100).optional().allow(null, ""),
  lastName: Joi.string().trim().max(100).optional().allow(null, ""),
  name: Joi.string().trim().max(200).optional().allow(null, ""),
  displayHandle: handle,
  mobile: Joi.string().trim().max(30).optional().allow(null, ""),
  residence: Joi.string().trim().max(500).optional().allow(null, ""),
  address: Joi.string().trim().max(500).optional().allow(null, ""),
  jobTitle: Joi.string().trim().max(200).optional().allow(null, ""),
  mobileCountryCode: Joi.string().trim().max(8).optional().allow(null, ""),
  membershipTier: Joi.string().trim().max(50).optional(),
  designation: Joi.string().trim().max(80).optional(),
  validityMonths: validityMonths.optional(),
});

/** @deprecated use inviteSchema */
exports.inviteMemberSchema = exports.inviteSchema;
/** @deprecated use inviteSchema */
exports.inviteStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().trim().max(100).optional().allow(null, ""),
  lastName: Joi.string().trim().max(100).optional().allow(null, ""),
  name: Joi.string().trim().max(200).optional().allow(null, ""),
  mobile: Joi.string().trim().max(30).optional().allow(null, ""),
  jobTitle: Joi.string().trim().max(200).optional().allow(null, ""),
  mobileCountryCode: Joi.string().trim().max(8).optional().allow(null, ""),
});

exports.verifyInvitationOtpSchema = Joi.object({
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

exports.setupPasswordSchema = Joi.object({
  setupToken: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
  }),
  email: Joi.string().email().optional(),
});

exports.resendInvitationSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const visibility = Joi.string().valid("members_only", "public", "private");

exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(100).optional().allow(null, ""),
  lastName: Joi.string().trim().max(100).optional().allow(null, ""),
  name: Joi.string().trim().max(200).optional().allow(null, ""),
  displayHandle: handle,
  email: Joi.string().email().optional(),
  mobile: Joi.string().trim().max(30).optional().allow(null, ""),
  mobileCountryCode: Joi.string().trim().max(8).optional().allow(null, ""),
  residence: Joi.string().trim().max(500).optional().allow(null, ""),
  address: Joi.string().trim().max(500).optional().allow(null, ""),
  jobTitle: Joi.string().trim().max(200).optional().allow(null, ""),
  coverImageUrl: Joi.string().uri().optional().allow(null, ""),
}).min(1);

exports.privacySettingsPatchSchema = Joi.object({
  biometricUnlockEnabled: Joi.boolean(),
  profileVisibility: visibility,
  showAtClub: Joi.boolean(),
  eventsAttendanceVisibility: visibility,
  vehicleVisibility: visibility,
}).min(1);

const otpCode = Joi.string()
  .pattern(/^\d{6}$/)
  .required();

exports.sendOtpSchema = Joi.object({
  purpose: Joi.string().valid("login", "change_password", "enable_2fa").required(),
  mfaToken: Joi.string().when("purpose", {
    is: "login",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

exports.verifyLogin2faSchema = Joi.object({
  mfaToken: Joi.string().required(),
  code: otpCode,
});

exports.verifyEnable2faSchema = Joi.object({
  code: otpCode,
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
  otp: Joi.string().pattern(/^\d{6}$/).optional().allow(null, ""),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: otpCode,
  newPassword: Joi.string().min(8).max(128).required(),
});
