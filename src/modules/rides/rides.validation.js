const Joi = require("joi");
const { memberIdJoi } = require("../../utils/resolveMemberRef");
const { Vehicle } = require("../../models");
const { WIZARD_HEALTH_KEYS } = require("./rides.constants");

const healthCategories = Vehicle.HEALTH_CATEGORIES;
const documentTypes = Vehicle.DOCUMENT_TYPES;
const wizardHealthCategories = WIZARD_HEALTH_KEYS;

const healthItemSchema = Joi.object({
  category: Joi.string()
    .valid(...healthCategories)
    .required(),
  percentage: Joi.number().integer().min(0).max(100).required(),
  note: Joi.string().max(2000).allow("", null),
});

const wizardHealthItemSchema = Joi.object({
  category: Joi.string()
    .valid(...wizardHealthCategories)
    .required(),
  percentage: Joi.number().integer().min(0).max(100).required(),
  note: Joi.string().max(2000).allow("", null),
});

function assertAllWizardHealth(health, helpers) {
  if (!health?.length) return health;
  const keys = new Set(health.map((h) => h.category));
  const missing = wizardHealthCategories.filter((k) => !keys.has(k));
  if (missing.length) {
    return helpers.error("any.custom", {
      message: `health must include: ${wizardHealthCategories.join(", ")}`,
    });
  }
  return health;
}

const vehicleInfoSchema = Joi.object({
  name: Joi.string().min(1).max(120),
  make: Joi.string().min(1).max(120),
  model: Joi.string().min(1).max(120).required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  engine: Joi.string().max(200).required(),
  power: Joi.string().max(200).required(),
  transmission: Joi.string().max(200).required(),
  drive: Joi.string().max(120).required(),
  zeroToHundred: Joi.string().max(80).required(),
  topSpeed: Joi.string().max(80).required(),
  fuelType: Joi.string().max(80),
  fuelEfficiency: Joi.string().max(80),
  maxTorque: Joi.string().max(80),
  interiorColor: Joi.string().max(120),
  vehicleType: Joi.string().valid("car", "bike", "other"),
  fuelLevel: Joi.string().max(40),
})
  .or("name", "make")
  .messages({
    "object.missing": "vehicleInfo requires either name or make (brand)",
  });

const ownershipInfoSchema = Joi.object({
  colour: Joi.string().max(120).required(),
  chassisNo: Joi.string().min(5).max(50).required(),
  plate: Joi.string().max(80).required(),
  purchasedAt: Joi.alternatives()
    .try(Joi.date().iso(), Joi.string().pattern(/^\d{4}-\d{2}(-\d{2})?$/))
    .required(),
  storageBay: Joi.string().max(120).required(),
  mileage: Joi.string().max(80).required(),
});

const documentsSchema = Joi.object({
  vehicleRegistration: Joi.string().uri().allow(""),
  insuranceCertificate: Joi.string().uri().allow(""),
  specsAndInfo: Joi.string().uri().allow(""),
  serviceRecord: Joi.string().uri().allow(""),
  purchasedInvoice: Joi.string().uri().allow(""),
  warrantyCertificate: Joi.string().uri().allow(""),
});

const registrationSteps = ["vehicle_info", "ownership", "docs", "health", "complete"];

/** Full wizard in one request (multipart POST /api/v1/vehicles) */
exports.addVehicleCompleteSchema = Joi.object({
  memberId: memberIdJoi(true),
  vehicleInfo: vehicleInfoSchema.required(),
  ownershipInfo: ownershipInfoSchema.required(),
  health: Joi.array().items(wizardHealthItemSchema).min(1).required(),
  status: Joi.string().max(100),
  isPriority: Joi.boolean(),
  registrationStep: Joi.string().valid("complete").default("complete"),
}).custom((value, helpers) => {
  assertAllWizardHealth(value.health, helpers);
  return value;
});

exports.addVehicleSchema = Joi.object({
  vehicleInfo: vehicleInfoSchema,
  ownershipInfo: ownershipInfoSchema,
  health: Joi.array().items(wizardHealthItemSchema).min(1),
  documents: documentsSchema,
  status: Joi.string().max(100),
  registrationStep: Joi.string()
    .valid(...registrationSteps)
    .default("complete"),
  memberId: memberIdJoi(false),
  isPriority: Joi.boolean(),
  imageUrl: Joi.string().uri().allow("", null),
  lastServicedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string()),
  ownerName: Joi.string().max(120),
  vehicleType: Joi.string().valid("car", "bike", "other"),
  fuelType: Joi.string().max(80),
  fuelLevel: Joi.string().max(40),
  interiorColor: Joi.string().max(120),
  fuelEfficiency: Joi.string().max(80),
  maxTorque: Joi.string().max(80),
}).custom((value, helpers) => {
  const step = value.registrationStep ?? "complete";

  if (step === "complete") {
    if (!value.vehicleInfo) {
      return helpers.error("any.custom", {
        message: "vehicleInfo is required when registrationStep is complete",
      });
    }
    if (!value.ownershipInfo) {
      return helpers.error("any.custom", {
        message: "ownershipInfo is required when registrationStep is complete",
      });
    }
    if (!value.health?.length) {
      return helpers.error("any.custom", {
        message: "health is required when registrationStep is complete",
      });
    }
    return value;
  }

  if (step === "vehicle_info" && !value.vehicleInfo) {
    return helpers.error("any.custom", {
      message: "vehicleInfo is required for registrationStep vehicle_info",
    });
  }
  if (step === "ownership" && !value.ownershipInfo) {
    return helpers.error("any.custom", {
      message: "ownershipInfo is required for registrationStep ownership",
    });
  }
  if (step === "health" && !value.health?.length) {
    return helpers.error("any.custom", {
      message: "health is required for registrationStep health",
    });
  }
  if ((step === "health" || step === "complete") && value.health?.length) {
    assertAllWizardHealth(value.health, helpers);
  }

  return value;
});

exports.updateVehicleStepSchema = Joi.object({
  vehicleInfo: vehicleInfoSchema,
  ownershipInfo: ownershipInfoSchema,
  health: Joi.array().items(wizardHealthItemSchema).min(1),
  documents: documentsSchema,
  status: Joi.string().max(100),
  registrationStep: Joi.string().valid("vehicle_info", "ownership", "docs", "health", "complete"),
  submit: Joi.boolean(),
  memberId: memberIdJoi(false),
  isPriority: Joi.boolean(),
  imageUrl: Joi.string().uri().allow("", null),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.submit || value.registrationStep === "complete") {
      if (!value.health?.length) {
        return helpers.error("any.custom", {
          message: "health with all 6 categories is required to submit",
        });
      }
      assertAllWizardHealth(value.health, helpers);
    }
    return value;
  });

exports.vehicleIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

/** @deprecated Use addVehicleSchema — kept for backward compatibility */
exports.createVehicleSchema = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  status: Joi.string().max(100),
});

exports.healthCategories = healthCategories;
exports.documentTypes = documentTypes;
exports.vehicleInfoSchema = vehicleInfoSchema;
exports.ownershipInfoSchema = ownershipInfoSchema;
exports.wizardHealthItemSchema = wizardHealthItemSchema;
exports.documentsSchema = documentsSchema;
exports.wizardHealthCategories = wizardHealthCategories;
exports.assertAllWizardHealth = assertAllWizardHealth;
