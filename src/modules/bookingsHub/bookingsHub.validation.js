const Joi = require("joi");

exports.listQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  tab: Joi.string().valid("all", "active", "completed", "cancelled").default("all"),
  limit: Joi.number().integer().min(1).max(100).default(50),
});
