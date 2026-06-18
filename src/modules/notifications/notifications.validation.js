const Joi = require("joi");

const timeHHmm = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/);

exports.notificationSettingsPatchSchema = Joi.object({
  preferences: Joi.object({
    pushEnabled: Joi.boolean(),
    emailEnabled: Joi.boolean(),
    emailDigestTime: timeHHmm,
    smsEnabled: Joi.boolean(),
  }).optional(),
  fromTheClub: Joi.object({
    messagesFromJamesEnabled: Joi.boolean(),
    vehicleStatusEnabled: Joi.boolean(),
    eventsInvitationsEnabled: Joi.boolean(),
    announcementsEnabled: Joi.boolean(),
  }).optional(),
  quietHours: Joi.object({
    doNotDisturbEnabled: Joi.boolean(),
    quietHoursEnabled: Joi.boolean(),
    quietHoursStart: timeHHmm,
    quietHoursEnd: timeHHmm,
  }).optional(),
}).min(1);

exports.inboxQuerySchema = Joi.object({
  unreadOnly: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

exports.inboxIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.registerDeviceSchema = Joi.object({
  token: Joi.string().trim().min(20).max(512).required(),
  platform: Joi.string().valid("ios", "android", "web").required(),
  deviceId: Joi.string().trim().max(128).optional(),
  appVersion: Joi.string().trim().max(32).optional(),
});

exports.unregisterDeviceSchema = Joi.object({
  token: Joi.string().trim().min(20).max(512).required(),
});

exports.testPushSchema = Joi.object({
  title: Joi.string().trim().max(120).optional(),
  body: Joi.string().trim().max(500).optional(),
  type: Joi.string()
    .valid(
      "general",
      "vehicle_status",
      "transport",
      "booking",
      "events",
      "messages",
      "announcement",
    )
    .optional(),
  data: Joi.object().optional(),
});
