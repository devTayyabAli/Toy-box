"use strict";

const asyncHandler = require("../../../middlewares/asyncHandler");
const Response = require("../../../helpers/response.helper");
const inventoryService = require("./inventory.service");

exports.getWizardSchema = asyncHandler(async (req, res) => {
  const data = inventoryService.getWizardSchema();
  return Response.success(res, "Admin add vehicle schema", data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await inventoryService.create(req.body, req.files || {});
  return Response.success(res, "Inventory vehicle added", data, 201);
});

exports.list = asyncHandler(async (req, res) => {
  const data = await inventoryService.list(req.query);
  return Response.success(res, "Admin inventory", data);
});

exports.getById = asyncHandler(async (req, res) => {
  const data = await inventoryService.getById(req.params.id);
  return Response.success(res, "Inventory vehicle", data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await inventoryService.update(req.params.id, req.body, req.files || {});
  return Response.success(res, "Inventory vehicle updated", data);
});

exports.remove = asyncHandler(async (req, res) => {
  const data = await inventoryService.remove(req.params.id);
  return Response.success(res, "Inventory vehicle removed", data);
});
