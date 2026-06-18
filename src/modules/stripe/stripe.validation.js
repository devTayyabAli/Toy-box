const Joi = require("joi");

const PURPOSES = ["maintenance", "detailing", "generic"];

exports.checkoutSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  purpose: Joi.string()
    .valid(...PURPOSES)
    .required(),
  referenceId: Joi.when("purpose", {
    is: Joi.valid("maintenance", "detailing"),
    then: Joi.number().integer().positive().required(),
    otherwise: Joi.number().integer().positive(),
  }),
  amountAed: Joi.when("purpose", {
    is: "generic",
    then: Joi.number().integer().positive().required(),
    otherwise: Joi.number().integer().positive(),
  }),
  description: Joi.string().max(200),
  referenceType: Joi.string().max(60),
  metadata: Joi.object(),
  successUrl: Joi.string().uri(),
  cancelUrl: Joi.string().uri(),
  lineItems: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      amountAed: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).default(1),
    }),
  ),
});

exports.setupCheckoutSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  successUrl: Joi.string().uri(),
  cancelUrl: Joi.string().uri(),
});

exports.sessionIdParamSchema = Joi.object({
  sessionId: Joi.string().min(10).required(),
});

exports.memberIdBodySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
});
