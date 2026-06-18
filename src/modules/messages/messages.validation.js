const Joi = require("joi");

exports.listQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().min(1).max(200).default(100),
});

exports.sendSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  body: Joi.string().min(1).max(4000).required(),
});

exports.memberIdParamSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
});
