const Joi = require("joi");

exports.createClinicSchema = Joi.object({
  name: Joi.string().min(1),
});
