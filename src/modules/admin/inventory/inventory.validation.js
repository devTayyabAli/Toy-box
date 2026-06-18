"use strict";

const Joi = require("joi");
const {
  vehicleInfoSchema,
  ownershipInfoSchema,
  wizardHealthItemSchema,
  documentsSchema,
  assertAllWizardHealth,
} = require("../../rides/rides.validation");

const inventoryVehicleBody = {
  vehicleInfo: vehicleInfoSchema.required(),
  ownershipInfo: ownershipInfoSchema.required(),
  health: Joi.array().items(wizardHealthItemSchema).min(1).required(),
  documents: documentsSchema,
  status: Joi.string().trim().max(100),
  isPriority: Joi.boolean(),
  imageUrl: Joi.string().uri().allow("", null),
  lastServicedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string()),
  vehicleType: Joi.string().valid("car", "bike", "other"),
  fuelType: Joi.string().max(80),
  fuelLevel: Joi.string().max(40),
  interiorColor: Joi.string().max(120),
  fuelEfficiency: Joi.string().max(80),
  maxTorque: Joi.string().max(80),
  registrationStep: Joi.string().valid("complete").default("complete"),
};

exports.createInventorySchema = Joi.object(inventoryVehicleBody).custom((value, helpers) => {
  assertAllWizardHealth(value.health, helpers);
  return value;
});

exports.updateInventorySchema = Joi.object({
  vehicleInfo: vehicleInfoSchema,
  ownershipInfo: ownershipInfoSchema,
  health: Joi.array().items(wizardHealthItemSchema).min(1),
  documents: documentsSchema,
  status: Joi.string().trim().max(100),
  isPriority: Joi.boolean(),
  imageUrl: Joi.string().uri().allow("", null),
  lastServicedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string()),
  vehicleType: Joi.string().valid("car", "bike", "other"),
  fuelType: Joi.string().max(80),
  fuelLevel: Joi.string().max(40),
  interiorColor: Joi.string().max(120),
  fuelEfficiency: Joi.string().max(80),
  maxTorque: Joi.string().max(80),
}).min(1);

exports.inventoryIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.inventoryListQuerySchema = Joi.object({
  search: Joi.string().max(100),
  status: Joi.string().max(40),
  limit: Joi.number().integer().min(1).max(100),
  offset: Joi.number().integer().min(0),
});
