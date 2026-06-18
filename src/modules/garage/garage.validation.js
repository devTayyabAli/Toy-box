const Joi = require("joi");
const { Vehicle } = require("../../models");
const {
  REQUEST_TYPES,
  REQUEST_STATUSES,
  VEHICLE_TYPE_TABS,
} = require("./garage.constants");

const vehicleTypeValues = VEHICLE_TYPE_TABS.flatMap((t) => [t.key, t.value]);

exports.listVehiclesQuerySchema = Joi.object({
  filter: Joi.string().valid("all", "priority", "mine").default("all"),
  search: Joi.string().max(120).allow(""),
  memberId: Joi.number().integer().positive(),
  vehicleType: Joi.string().valid(...vehicleTypeValues),
  garageStatus: Joi.string().valid("all", "ready", "in_service", "stored"),
  view: Joi.string().valid("wizard", "garage"),
});

exports.garageOverviewQuerySchema = Joi.object({
  filter: Joi.string().valid("all", "priority", "mine").default("mine"),
  search: Joi.string().max(120).allow(""),
  memberId: Joi.number().integer().positive().required(),
  selectedVehicleId: Joi.number().integer().positive(),
});

exports.vehicleDetailQuerySchema = Joi.object({
  include: Joi.string().max(200),
  view: Joi.string().valid("wizard", "garage"),
  actionsLimit: Joi.number().integer().min(1).max(50),
  requestsLimit: Joi.number().integer().min(1).max(50),
});

exports.vehicleIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id must be a numeric vehicle id (replace Swagger placeholder {id})",
  }),
});

exports.listRequestsQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive(),
  vehicleId: Joi.number().integer().positive(),
  status: Joi.string().valid(...REQUEST_STATUSES),
  type: Joi.string().valid(...REQUEST_TYPES),
  tab: Joi.string().valid("active", "past"),
  unified: Joi.string().valid("true", "false"),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

exports.createGarageRequestSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  vehicleId: Joi.number().integer().positive().required(),
  type: Joi.string().valid(...REQUEST_TYPES),
  serviceCategory: Joi.string().valid(
    "maintenance_repair",
    "vehicle_source_assistance",
    "detailing_cleaning",
    "other_services",
  ),
  title: Joi.string().max(200),
  notes: Joi.string().max(2000).allow("", null),
  scheduledAt: Joi.date().iso(),
  status: Joi.string().valid(...REQUEST_STATUSES),
})
  .or("type", "serviceCategory")
  .messages({
    "object.missing": "Either type or serviceCategory is required",
  });

exports.togglePrioritySchema = Joi.object({
  isPriority: Joi.boolean().required(),
});

exports.requestCategoriesQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive(),
});

exports.updateHealthSchema = Joi.object({
  health: Joi.array()
    .items(
      Joi.object({
        category: Joi.string()
          .valid(...Vehicle.HEALTH_CATEGORIES)
          .required(),
        percentage: Joi.number().integer().min(0).max(100).required(),
        note: Joi.string().max(2000).allow("", null),
      }),
    )
    .min(1)
    .required(),
});

exports.uploadDocumentSchema = Joi.object({
  documentKey: Joi.string()
    .valid(...Vehicle.DOCUMENT_TYPES)
    .required(),
});

exports.vehicleActionsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(20),
});

exports.vehicleRequestsQuerySchema = Joi.object({
  tab: Joi.string().valid("active", "past"),
  unified: Joi.string().valid("true", "false"),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

exports.requestIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
