"use strict";

const Joi = require("joi");

exports.staffListQuerySchema = Joi.object({
  status: Joi.string().valid("all", "active", "pending_activation").default("all"),
  search: Joi.string().trim().max(120),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

exports.staffIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.adminInviteStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  jobTitle: Joi.string().trim().max(200).required(),
  mobile: Joi.string().trim().max(30).optional().allow(null, ""),
  mobileCountryCode: Joi.string().trim().max(8).optional().allow(null, ""),
});
