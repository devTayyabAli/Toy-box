const Joi = require("joi");

const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(6).max(30).required(),
  email: Joi.string().email(),
  cnic: Joi.string().min(5).max(30),
  address: Joi.string().max(255),
  isActive: Joi.boolean(),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  phone: Joi.string().min(6).max(30),
  email: Joi.string().email(),
  cnic: Joi.string().min(5).max(30),
  address: Joi.string().max(255),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
