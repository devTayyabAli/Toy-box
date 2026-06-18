const Joi = require("joi");
const { TRANSPORT_SERVICE_TYPE_KEYS } = require("./transport.constants");
const { memberIdJoi } = require("../../utils/resolveMemberRef");
const { resolveServiceType, isDeliveryFromStorage, trimOrNull } = require("./transport.mapper");

const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Optional text from the app — empty string is treated as not sent. */
const optionalString = (max = 300) =>
  Joi.string().max(max).allow("", null).empty("").optional();

const baseFields = {
  memberId: memberIdJoi(true),
  vehicleId: Joi.number().integer().positive().required(),
  serviceType: Joi.string()
    .valid(...TRANSPORT_SERVICE_TYPE_KEYS)
    .allow("", null)
    .empty("")
    .optional(),
  requestType: Joi.string()
    .valid(...TRANSPORT_SERVICE_TYPE_KEYS)
    .allow("", null)
    .empty("")
    .optional(),
  deliveryAddress: optionalString(300),
  destination: optionalString(300),
  address: optionalString(300),
  pickupAddress: optionalString(300),
  dropoffAddress: optionalString(300),
  preferredDate: Joi.alternatives().try(Joi.date().iso(), Joi.string().pattern(datePattern)),
  scheduledDate: Joi.alternatives().try(Joi.date().iso(), Joi.string().pattern(datePattern)),
  timeWindowStart: Joi.string().pattern(timePattern).allow("", null).empty("").optional(),
  timeWindowEnd: Joi.string().pattern(timePattern).allow("", null).empty("").optional(),
  timeWindow: optionalString(40),
  notes: optionalString(2000),
  storageLocation: optionalString(300),
  pickupLocation: optionalString(300),
  dropoffLocation: optionalString(300),
  scheduledAt: Joi.date().iso().optional(),
};

function hasNonEmpty(value, ...keys) {
  return keys.some((k) => trimOrNull(value[k]));
}

exports.createSchema = Joi.object(baseFields)
  .or("serviceType", "requestType", "pickupLocation", "deliveryAddress")
  .messages({
    "object.missing":
      "serviceType or requestType is required (e.g. transport_delivery or pickup_from_storage)",
  })
  .custom((value, helpers) => {
    const serviceType = resolveServiceType(value);

    if (
      !serviceType &&
      trimOrNull(value.pickupLocation) &&
      trimOrNull(value.dropoffLocation) &&
      value.scheduledAt
    ) {
      return value;
    }

    if (!serviceType) {
      return helpers.error("any.custom", {
        message:
          "serviceType or requestType is required (pickup_from_storage, transport_delivery, return_to_storage, or custom_transfer)",
      });
    }

    const hasDate = value.preferredDate || value.scheduledDate || value.scheduledAt;
    const hasWindow =
      (trimOrNull(value.timeWindowStart) && trimOrNull(value.timeWindowEnd)) ||
      trimOrNull(value.timeWindow) ||
      value.scheduledAt;

    if (!hasDate) {
      return helpers.error("any.custom", {
        message: "preferredDate is required (YYYY-MM-DD)",
      });
    }
    if (!hasWindow && !value.scheduledAt) {
      return helpers.error("any.custom", {
        message: "timeWindowStart & timeWindowEnd (or timeWindow) are required",
      });
    }

    if (isDeliveryFromStorage(serviceType)) {
      const addr = hasNonEmpty(
        value,
        "deliveryAddress",
        "destination",
        "address",
        "dropoffLocation",
        "dropoffAddress",
      );
      if (!addr) {
        return helpers.error("any.custom", {
          message: "deliveryAddress is required for this request",
        });
      }
    }

    if (serviceType === "return_to_storage") {
      const addr = hasNonEmpty(
        value,
        "pickupAddress",
        "deliveryAddress",
        "destination",
        "address",
        "pickupLocation",
      );
      if (!addr) {
        return helpers.error("any.custom", {
          message: "pickupAddress (your location) is required for return_to_storage",
        });
      }
    }

    if (serviceType === "custom_transfer") {
      const pickup = hasNonEmpty(value, "pickupAddress", "pickupLocation");
      const dropoff = hasNonEmpty(
        value,
        "dropoffAddress",
        "dropoffLocation",
        "deliveryAddress",
      );
      if (!pickup || !dropoff) {
        return helpers.error("any.custom", {
          message: "pickupAddress and dropoffAddress are required for custom_transfer",
        });
      }
    }

    return value;
  });

exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.listQuerySchema = Joi.object({
  memberId: memberIdJoi(false),
  status: Joi.string().max(80),
  referenceNumber: Joi.string().max(80),
  requestType: Joi.string().max(80),
  type: Joi.string().max(80),
  tab: Joi.string().valid("all", "active", "past", "completed", "cancelled"),
  unified: Joi.boolean().default(true),
  source: Joi.string().valid(
    "transport",
    "detailing",
    "maintenance",
    "sourcing",
    "garage_request",
  ),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

exports.getByIdQuerySchema = Joi.object({
  memberId: memberIdJoi(false),
  source: Joi.string()
    .valid("transport", "detailing", "maintenance", "sourcing", "garage_request")
    .default("transport"),
  referenceNumber: Joi.string().max(80),
});
