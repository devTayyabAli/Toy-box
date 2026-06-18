const Joi = require("joi");

exports.supportSearchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required(),
});
