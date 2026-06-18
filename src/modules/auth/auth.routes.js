const express = require("express");
const multer = require("multer");
const { credentialAuthLimiter } = require("../../middlewares/rateLimit.middleware");
const authenticate = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/requireRole.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const authController = require("./auth.controller");
const {
  signInSchema,
  inviteSchema,
  setupPasswordSchema,
  verifyInvitationOtpSchema,
  resendInvitationSchema,
  refreshSchema,
  updateProfileSchema,
  privacySettingsPatchSchema,
  sendOtpSchema,
  verifyLogin2faSchema,
  verifyEnable2faSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("./auth.validation");

const router = express.Router();

function requireAuthUnlessLoginOtp(req, res, next) {
  if (req.body && req.body.purpose === "login") {
    return next();
  }
  return authenticate(req, res, next);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/status", authController.status);
router.post("/sign-in", credentialAuthLimiter, validate(signInSchema), authController.signIn);
router.post(
  "/invitations",
  authenticate,
  requireRole("admin"),
  validate(inviteSchema),
  authController.invite,
);
router.post(
  "/invitations/resend",
  authenticate,
  requireRole("admin"),
  validate(resendInvitationSchema),
  authController.resendInvitation,
);
router.post(
  "/invitations/verify-otp",
  credentialAuthLimiter,
  validate(verifyInvitationOtpSchema),
  authController.verifyInvitationOtp,
);
router.post(
  "/setup-password",
  credentialAuthLimiter,
  validate(setupPasswordSchema),
  authController.setupPassword,
);
router.post(
  "/forgot-password",
  credentialAuthLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  credentialAuthLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post(
  "/2fa/send-otp",
  credentialAuthLimiter,
  requireAuthUnlessLoginOtp,
  validate(sendOtpSchema),
  authController.sendOtp,
);
router.post(
  "/2fa/verify-login",
  credentialAuthLimiter,
  validate(verifyLogin2faSchema),
  authController.verifyLogin2fa,
);
router.post(
  "/2fa/verify-enable",
  authenticate,
  validate(verifyEnable2faSchema),
  authController.verifyEnable2fa,
);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.get("/profile", authenticate, authController.getProfile);
router.get("/profile/billing", authenticate, authController.getProfileBilling);
router.get("/profile/privacy", authenticate, authController.getProfilePrivacy);
router.patch(
  "/profile/privacy",
  authenticate,
  validate(privacySettingsPatchSchema),
  authController.updateProfilePrivacy,
);
router.get("/profile/sessions", authenticate, authController.getProfileSessions);
router.get("/profile/membership-tiers", authenticate, authController.listMembershipTiers);
router.patch("/profile", authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post(
  "/profile/photo",
  authenticate,
  upload.single("image"),
  authController.updateProfilePhoto,
);
router.post(
  "/profile/cover",
  authenticate,
  upload.single("coverImage"),
  authController.updateCoverImage,
);

module.exports = router;
