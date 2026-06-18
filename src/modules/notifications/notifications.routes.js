const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const notificationsController = require("./notifications.controller");
const {
  notificationSettingsPatchSchema,
  inboxQuerySchema,
  inboxIdParamSchema,
  registerDeviceSchema,
  unregisterDeviceSchema,
  testPushSchema,
} = require("./notifications.validation");

/**
 * @swagger
 * /api/v1/notifications/settings:
 *   get:
 *     summary: Get notification preferences (channels & alerts)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current settings merged with defaults
 *       401:
 *         description: Unauthorized
 */
router.get("/firebase-config", notificationsController.getFirebaseConfig);

router.get("/push-status", authenticate, notificationsController.getPushStatus);

router.post(
  "/test-push",
  authenticate,
  validate(testPushSchema),
  notificationsController.sendTestPush,
);

/**
 * @swagger
 * /api/v1/notifications/inbox/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications read (PATCH)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *
 * /api/v1/notifications/inbox/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark one notification read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/inboxIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark one notification read (PATCH)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/inboxIdPath'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success200'
 */
router.get("/inbox", authenticate, validate(inboxQuerySchema, "query"), notificationsController.listInbox);
const markAllInboxRead = [
  authenticate,
  notificationsController.markAllInboxRead,
];
router.patch("/inbox/read-all", ...markAllInboxRead);
router.post("/inbox/read-all", ...markAllInboxRead);

const markInboxRead = [
  authenticate,
  validate(inboxIdParamSchema, "params"),
  notificationsController.markInboxRead,
];
router.patch("/inbox/:id/read", ...markInboxRead);
router.post("/inbox/:id/read", ...markInboxRead);

router.get("/settings", authenticate, notificationsController.getSettings);

/**
 * @swagger
 * /api/v1/notifications/settings:
 *   patch:
 *     summary: Update notification preferences (partial)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   pushEnabled: { type: boolean }
 *                   emailEnabled: { type: boolean }
 *                   emailDigestTime: { type: string, example: "09:00" }
 *                   smsEnabled: { type: boolean }
 *               fromTheClub:
 *                 type: object
 *                 properties:
 *                   messagesFromJamesEnabled: { type: boolean }
 *                   vehicleStatusEnabled: { type: boolean }
 *                   eventsInvitationsEnabled: { type: boolean }
 *                   announcementsEnabled: { type: boolean }
 *               quietHours:
 *                 type: object
 *                 properties:
 *                   doNotDisturbEnabled: { type: boolean }
 *                   quietHoursEnabled: { type: boolean }
 *                   quietHoursStart: { type: string, example: "22:00" }
 *                   quietHoursEnd: { type: string, example: "07:00" }
 */
router.patch(
  "/settings",
  authenticate,
  validate(notificationSettingsPatchSchema),
  notificationsController.patchSettings,
);

/**
 * @swagger
 * /api/v1/notifications/devices:
 *   post:
 *     summary: Register FCM device token (iOS uses APNS via Firebase)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, platform]
 *             properties:
 *               token: { type: string }
 *               platform: { type: string, enum: [ios, android, web] }
 *               deviceId: { type: string }
 *               appVersion: { type: string }
 *     responses:
 *       201:
 *         description: Device registered
 *       503:
 *         description: Firebase not configured
 */
router.post(
  "/devices",
  authenticate,
  validate(registerDeviceSchema),
  notificationsController.registerDevice,
);

router.get("/devices", authenticate, notificationsController.listDevices);

router.delete(
  "/devices",
  authenticate,
  validate(unregisterDeviceSchema),
  notificationsController.unregisterDevice,
);

module.exports = router;
