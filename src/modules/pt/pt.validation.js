const Joi = require("joi");

exports.createPtSchema = Joi.object({
  name: Joi.string().min(1),
});
