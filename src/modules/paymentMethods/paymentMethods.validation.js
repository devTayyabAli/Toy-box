const Joi = require("joi");

exports.memberIdQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
});

exports.memberIdBodySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  successUrl: Joi.string().uri(),
  cancelUrl: Joi.string().uri(),
});

exports.createSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  label: Joi.string().max(80).required(),
  brand: Joi.string().max(40),
  last4: Joi.string().length(4).pattern(/^\d{4}$/),
  expiryMonth: Joi.number().integer().min(1).max(12),
  expiryYear: Joi.number().integer().min(2020).max(2100),
  isDefault: Joi.boolean(),
});

exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
