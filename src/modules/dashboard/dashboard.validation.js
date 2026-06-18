const Joi = require("joi");

exports.summaryQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
});
