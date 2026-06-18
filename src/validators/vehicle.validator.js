const Joi = require("joi");

const createVehicleSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  model: Joi.string().min(1).max(120).required(),
  registrationNumber: Joi.string().min(3).max(30).required(),
  rentPerDay: Joi.number().positive().required(),
  status: Joi.string().valid("available", "booked", "maintenance"),
  fuelType: Joi.string().valid("petrol", "diesel", "electric"),
  transmission: Joi.string().valid("manual", "automatic"),
  seatingCapacity: Joi.number().integer().positive(),
  isActive: Joi.boolean(),
});

const updateVehicleSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  model: Joi.string().min(1).max(120),
  registrationNumber: Joi.string().min(3).max(30),
  rentPerDay: Joi.number().positive(),
  status: Joi.string().valid("available", "booked", "maintenance"),
  fuelType: Joi.string().valid("petrol", "diesel", "electric"),
  transmission: Joi.string().valid("manual", "automatic"),
  seatingCapacity: Joi.number().integer().positive(),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
};
