const Joi = require("joi");

const requestFields = {
  make: Joi.string().min(1).max(80).required(),
  model: Joi.string().min(1).max(120).required(),
  yearMin: Joi.number().integer().min(1900).max(2100),
  yearMax: Joi.number().integer().min(1900).max(2100),
  colour: Joi.string().max(80),
  trim: Joi.string().max(120),
  specifications: Joi.object().default({}),
  budgetMin: Joi.number().integer().min(0),
  budgetMax: Joi.number().integer().min(0),
  currency: Joi.string().max(10).default("AED"),
  timelineNotes: Joi.string().max(200),
  notes: Joi.string().max(2000).allow("", null),
};

const requestBodySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  ...requestFields,
});

exports.createRequestSchema = requestBodySchema;
exports.createMyRequestSchema = Joi.object(requestFields);
exports.reviewSchema = requestBodySchema;

exports.rejectVehicleSchema = Joi.object({
  rejectionReason: Joi.string().max(1000).allow(null, ""),
});

exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.listQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().empty("").optional(),
  status: Joi.string().max(80).empty("").optional(),
  limit: Joi.number().integer().min(1).max(100).empty("").default(20),
  offset: Joi.number().integer().min(0).empty("").default(0),
});
