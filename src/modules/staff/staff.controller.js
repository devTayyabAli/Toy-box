"use strict";

const asyncHandler = require("../../middlewares/asyncHandler");
const Response = require("../../helpers/response.helper");
const staffService = require("./staff.service");

exports.getOverview = asyncHandler(async (req, res) => {
  const data = await staffService.getOverview(req.user.id);
  return Response.success(res, "Staff overview", data);
});
