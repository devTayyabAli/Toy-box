"use strict";

const asyncHandler = require("../../../middlewares/asyncHandler");
const Response = require("../../../helpers/response.helper");
const staffSourcingService = require("./staffSourcing.service");

exports.listRequests = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.listRequests(req.query);
  return Response.success(res, "Sourcing requests", data);
});

exports.getRequest = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.getRequest(req.params.id);
  return Response.success(res, "Sourcing request", data);
});

exports.assignVehicle = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.assignVehicle(
    req.params.id,
    req.body.vehicleId,
    req.user.id,
    {
      adminNotes: req.body.adminNotes,
      memberId: req.body.memberId,
      offerStartDate: req.body.offerStartDate || req.body.startDate,
      offerEndDate: req.body.offerEndDate || req.body.endDate,
    },
  );
  return Response.success(res, data.message, data, 201);
});

exports.listAssignments = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.listAssignments(req.params.id);
  return Response.success(res, "Assignments", data);
});

exports.getSummary = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.getSummary();
  return Response.success(res, "Job confirmation summary", data);
});

exports.getOfferOptions = asyncHandler(async (req, res) => {
  const data = await staffSourcingService.getOfferOptions(req.params.id);
  return Response.success(res, "Offer a vehicle form options", data);
});
