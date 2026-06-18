const Joi = require("joi");

exports.createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().max(255).allow(null, ""),
  roleId: Joi.number().integer().allow(null),
});
