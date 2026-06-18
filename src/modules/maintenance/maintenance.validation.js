const Joi = require("joi");
const { SERVICE_TYPES, LOCATIONS } = require("./maintenance.data");

const serviceKeys = SERVICE_TYPES.map((s) => s.key);
const locationKeys = LOCATIONS.map((l) => l.key);

const requestBodySchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  vehicleId: Joi.number().integer().positive().required(),
  serviceKeys: Joi.array()
    .items(Joi.string().valid(...serviceKeys))
    .min(1)
    .required(),
  scheduledAt: Joi.date().iso().required(),
  locationKey: Joi.string()
    .valid(...locationKeys)
    .required(),
  notes: Joi.string().max(2000).allow("", null),
  documentUrls: Joi.array().items(Joi.string().uri()).default([]),
});

exports.createRequestSchema = requestBodySchema;
exports.estimateSchema = requestBodySchema;
exports.updateRequestSchema = Joi.object({
  serviceKeys: Joi.array().items(Joi.string().valid(...serviceKeys)).min(1),
  scheduledAt: Joi.date().iso(),
  locationKey: Joi.string().valid(...locationKeys),
  notes: Joi.string().max(2000).allow("", null),
  documentUrls: Joi.array().items(Joi.string().uri()),
}).min(1);

exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.checklistSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        done: Joi.boolean().required(),
      }),
    )
    .min(1)
    .required(),
});

exports.jobStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Service in progress", "Ready for delivery", "Completed")
    .required(),
});

exports.listRequestsQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive(),
  status: Joi.string().max(80),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

exports.listJobsQuerySchema = Joi.object({
  status: Joi.string().max(80),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
