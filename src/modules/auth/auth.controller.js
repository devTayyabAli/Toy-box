const Response = require("../../helpers/response.helper");
const asyncHandler = require("../../middlewares/asyncHandler");
const authenticate = require("../../middlewares/auth.middleware");
const authService = require("./auth.service");

exports.status = (req, res) => {
  res.json({ success: true, data: { auth: "ok" } });
};

exports.invite = asyncHandler(async (req, res) => {
  const result = await authService.invite(req.body);
  return Response.success(res, result.message || "Invitation sent", result, 201);
});

exports.setupPassword = asyncHandler(async (req, res) => {
  const result = await authService.setupPassword(req.body);
  return Response.success(res, result.message || "Password updated", result);
});

exports.resendInvitation = asyncHandler(async (req, res) => {
  const result = await authService.resendInvitation(req.body);
  return Response.success(res, result.message, result);
});

exports.verifyInvitationOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyInvitationOtp(req.body);
  return Response.success(res, result.message, result);
});

exports.signIn = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  const role = result.role || "user";
  return Response.success(res, `${role.charAt(0).toUpperCase()}${role.slice(1)} signed in`, result);
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  return Response.success(res, "Tokens refreshed", result);
});

exports.getProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  return Response.success(res, "Profile", data);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  return Response.success(res, "Profile updated", data);
});

exports.updateProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return Response.validationError(res, "Validation failed", [
      { field: "image", message: "Image file (field name: image) is required" },
    ]);
  }
  const data = await authService.updateProfilePhoto(req.user.id, req.file);
  return Response.success(res, "Profile photo updated", data);
});

exports.updateCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return Response.validationError(res, "Validation failed", [
      { field: "coverImage", message: "Cover image file (field name: coverImage) is required" },
    ]);
  }
  const data = await authService.updateCoverImage(req.user.id, req.file);
  return Response.success(res, "Cover image updated", data);
});

exports.sendOtp = asyncHandler(async (req, res) => {
  const result = await authService.sendOtp(req.body, req.user?.id);
  return Response.success(res, "OTP sent", result);
});

exports.verifyLogin2fa = asyncHandler(async (req, res) => {
  const result = await authService.verifyLogin2fa(req.body);
  return Response.success(res, "Authenticated", result);
});

exports.verifyEnable2fa = asyncHandler(async (req, res) => {
  const result = await authService.verifyEnable2fa(req.user.id, req.body.code);
  return Response.success(res, "Two-factor authentication enabled", result);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  return Response.success(res, result.message, result);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return Response.success(res, result.message, result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return Response.success(res, result.message, result);
});

exports.getProfileBilling = asyncHandler(async (req, res) => {
  const data = await authService.getProfileBilling(req.user.id);
  return Response.success(res, "Billing summary", data);
});

exports.getProfilePrivacy = asyncHandler(async (req, res) => {
  const data = await authService.getProfilePrivacy(req.user.id);
  return Response.success(res, "Privacy settings", data);
});

exports.updateProfilePrivacy = asyncHandler(async (req, res) => {
  const data = await authService.updateProfilePrivacy(req.user.id, req.body);
  return Response.success(res, "Privacy settings updated", data);
});

exports.getProfileSessions = asyncHandler(async (req, res) => {
  const data = await authService.getProfileSessions(req.user.id, req);
  return Response.success(res, "Active sessions", data);
});

exports.listMembershipTiers = asyncHandler(async (req, res) => {
  const data = await authService.listMembershipTiers();
  return Response.success(res, "Membership tiers", data);
});
