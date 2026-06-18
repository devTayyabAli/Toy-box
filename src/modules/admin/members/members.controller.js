"use strict";

const asyncHandler = require("../../../middlewares/asyncHandler");
const Response = require("../../../helpers/response.helper");
const membersService = require("./members.service");

exports.getSummary = asyncHandler(async (req, res) => {
  const data = await membersService.getSummary();
  return Response.success(res, "Members summary", data);
});

exports.list = asyncHandler(async (req, res) => {
  const data = await membersService.list(req.query);
  return Response.success(res, "Members directory", data);
});

exports.getById = asyncHandler(async (req, res) => {
  const data = await membersService.getById(req.params.id);
  return Response.success(res, "Member profile", data);
});

exports.invite = asyncHandler(async (req, res) => {
  const data = await membersService.invite(req.body);
  return Response.success(res, "Member invitation sent", data, 201);
});
