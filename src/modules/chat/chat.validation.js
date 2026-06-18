"use strict";

const Joi = require("joi");

exports.initiateSchema = Joi.object({
  initialMessage: Joi.string().max(4000).allow("", null),
});

exports.sendMessageSchema = Joi.object({
  body: Joi.string().min(1).max(4000).required(),
});

exports.adminInitiateSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
  initialMessage: Joi.string().max(4000).allow("", null),
});

exports.adminSendSchema = Joi.object({
  body: Joi.string().min(1).max(4000).required(),
});

exports.memberIdParamSchema = Joi.object({
  memberId: Joi.number().integer().positive().required(),
});

exports.listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
});

exports.adminListQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  status: Joi.string().valid("active", "closed").default("active"),
});
