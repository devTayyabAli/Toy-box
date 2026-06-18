const Joi = require("joi");

exports.createRoleRequestSchema = Joi.object({
  role: Joi.string().min(1),
});
