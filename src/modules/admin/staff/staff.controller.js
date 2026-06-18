"use strict";

const asyncHandler = require("../../../middlewares/asyncHandler");
const Response = require("../../../helpers/response.helper");
const staffService = require("./staff.service");

exports.getSummary = asyncHandler(async (req, res) => {
  const data = await staffService.getSummary();
  return Response.success(res, "Staff summary", data);
});

exports.list = asyncHandler(async (req, res) => {
  const data = await staffService.list(req.query);
  return Response.success(res, "Staff directory", data);
});

exports.getById = asyncHandler(async (req, res) => {
  const data = await staffService.getById(req.params.id);
  return Response.success(res, "Staff profile", data);
});

exports.invite = asyncHandler(async (req, res) => {
  const data = await staffService.invite(req.body);
  return Response.success(res, "Staff invitation sent", data, 201);
});
