const Joi = require("joi");
const { PACKAGES, ADDONS } = require("./detailing.data");
const { SERVICE_LOCATIONS } = require("./detailing.constants");

const packageKeys = [
  ...PACKAGES.map((p) => p.key),
  "exterior_only",
  "signature_detail",
];
const addonKeys = ADDONS.map((a) => a.key);
const locationKeys = SERVICE_LOCATIONS.map((l) => l.key);
const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const bookingBodySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  vehicleId: Joi.number().integer().positive().required(),
  packageKey: Joi.string()
    .valid(...packageKeys)
    .required(),
  addonKeys: Joi.array()
    .items(Joi.string().valid(...addonKeys))
    .default([]),
  preferredDate: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(datePattern),
  ),
  scheduledDate: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(datePattern),
  ),
  timeWindowStart: Joi.string().pattern(timePattern),
  timeWindowEnd: Joi.string().pattern(timePattern),
  timeWindow: Joi.string().max(40),
  locationKey: Joi.string().valid(...locationKeys),
  serviceLocationKey: Joi.string().valid(...locationKeys),
  serviceLocation: Joi.string().max(300),
  location: Joi.string().max(300),
  specialInstructions: Joi.string().max(2000).allow("", null),
  notes: Joi.string().max(2000).allow("", null),
})
  .or("preferredDate", "scheduledDate")
  .custom((value, helpers) => {
    const hasDate = value.preferredDate || value.scheduledDate;
    if (!hasDate) {
      return helpers.error("any.custom", {
        message: "preferredDate is required (YYYY-MM-DD)",
      });
    }
    const hasWindow =
      (value.timeWindowStart && value.timeWindowEnd) || value.timeWindow;
    if (!hasWindow) {
      return helpers.error("any.custom", {
        message: "timeWindowStart & timeWindowEnd (or timeWindow) are required",
      });
    }
    const hasLocation =
      value.locationKey ||
      value.serviceLocationKey ||
      value.serviceLocation?.trim() ||
      value.location?.trim();
    if (!hasLocation) {
      return helpers.error("any.custom", {
        message: "locationKey or serviceLocation is required",
      });
    }
    return value;
  });

exports.estimateSchema = bookingBodySchema;
exports.createBookingSchema = bookingBodySchema;

exports.updateBookingSchema = Joi.object({
  packageKey: Joi.string().valid(...packageKeys),
  addonKeys: Joi.array().items(Joi.string().valid(...addonKeys)),
  preferredDate: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(datePattern),
  ),
  scheduledDate: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(datePattern),
  ),
  timeWindowStart: Joi.string().pattern(timePattern),
  timeWindowEnd: Joi.string().pattern(timePattern),
  timeWindow: Joi.string().max(40),
  locationKey: Joi.string().valid(...locationKeys),
  serviceLocation: Joi.string().max(300),
  specialInstructions: Joi.string().max(2000).allow("", null),
  notes: Joi.string().max(2000).allow("", null),
}).min(1);

exports.bookingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.listBookingsQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive(),
  status: Joi.string().max(80),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
