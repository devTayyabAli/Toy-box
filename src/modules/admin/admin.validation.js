"use strict";

const Joi = require("joi");

exports.assignVehicleSchema = Joi.object({
  vehicleId: Joi.number().integer().positive().required(),
  memberId: Joi.number().integer().positive().required(),
  adminNotes: Joi.string().max(2000).allow(null, ""),
  offerStartDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()).required(),
  offerEndDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()).required(),
  startDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()),
  endDate: Joi.alternatives().try(Joi.date().iso(), Joi.string()),
}).custom((value, helpers) => {
  const start = new Date(value.offerStartDate || value.startDate);
  const end = new Date(value.offerEndDate || value.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return helpers.error("any.invalid");
  }
  if (end < start) {
    return helpers.message("offerEndDate must be on or after offerStartDate");
  }
  return value;
});

exports.sourcingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.adminListQuerySchema = Joi.object({
  memberId: Joi.number().integer().positive().empty("").optional(),
  status: Joi.string().max(80).empty("").optional(),
  search: Joi.string().max(100).empty("").optional(),
  limit: Joi.number().integer().min(1).max(100).empty("").default(50),
  offset: Joi.number().integer().min(0).empty("").default(0),
});
