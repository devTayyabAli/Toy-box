"use strict";

const Joi = require("joi");

exports.fleetListQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  status: Joi.string().trim().max(60),
  storageBay: Joi.string().trim().max(40),
  summaryKey: Joi.string().valid(
    "ready",
    "in_service",
    "in_storage",
    "overdue_service",
  ),
  level: Joi.string().trim().valid("01").default("01"),
  includeBayMap: Joi.string().valid("true", "false").default("true"),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

exports.fleetIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
