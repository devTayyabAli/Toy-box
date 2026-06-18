"use strict";

const Joi = require("joi");
const {
  MEMBERSHIP_TIER_KEYS,
  VALIDITY_MONTHS_OPTIONS,
} = require("./members.constants");

exports.membersListQuerySchema = Joi.object({
  tier: Joi.string()
    .valid("all", ...MEMBERSHIP_TIER_KEYS, "principle", "vip", "black card")
    .default("all"),
  search: Joi.string().trim().max(120),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

exports.memberIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

exports.adminInviteMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().trim().max(200).required(),
  designation: Joi.string().trim().max(80).required(),
  validityMonths: Joi.number()
    .integer()
    .valid(...VALIDITY_MONTHS_OPTIONS)
    .default(12),
  mobile: Joi.string().trim().max(30).optional().allow(null, ""),
  mobileCountryCode: Joi.string().trim().max(8).optional().allow(null, ""),
  residence: Joi.string().trim().max(500).optional().allow(null, ""),
  displayHandle: Joi.string().trim().max(50).optional().allow(null, ""),
});
