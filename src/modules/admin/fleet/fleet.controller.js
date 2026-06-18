"use strict";

const asyncHandler = require("../../../middlewares/asyncHandler");
const Response = require("../../../helpers/response.helper");
const fleetService = require("./fleet.service");

exports.list = asyncHandler(async (req, res) => {
  const data = await fleetService.list(req.query);
  return Response.success(res, "Fleet vehicles", data);
});

exports.getById = asyncHandler(async (req, res) => {
  const data = await fleetService.getById(req.params.id);
  return Response.success(res, "Vehicle details", data);
});
