"use strict";

const { Op } = require("sequelize");
const { SourcingVehicleAssignment, Vehicle, SourcingRequest } = require("../../models");

const vehicleInclude = {
  model: Vehicle,
  as: "vehicle",
};

exports.findPendingForRequest = (sourcingRequestId) =>
  SourcingVehicleAssignment.findOne({
    where: { sourcingRequestId, status: "pending_member_approval" },
    include: [vehicleInclude],
    order: [["assignedAt", "DESC"]],
  });

exports.findById = (id) =>
  SourcingVehicleAssignment.findByPk(id, {
    include: [vehicleInclude, { model: SourcingRequest, as: "sourcingRequest" }],
  });

exports.findAllForRequest = (sourcingRequestId) =>
  SourcingVehicleAssignment.findAll({
    where: { sourcingRequestId },
    include: [vehicleInclude],
    order: [["assignedAt", "DESC"]],
  });

exports.create = (data) => SourcingVehicleAssignment.create(data);

exports.update = async (id, data) => {
  const row = await SourcingVehicleAssignment.findByPk(id);
  if (!row) return null;
  await row.update(data);
  return exports.findById(id);
};

exports.withdrawPendingForRequest = (sourcingRequestId) =>
  SourcingVehicleAssignment.update(
    { status: "withdrawn" },
    { where: { sourcingRequestId, status: "pending_member_approval" } },
  );

exports.isVehicleAssignedPending = async (vehicleId) => {
  const n = await SourcingVehicleAssignment.count({
    where: { vehicleId, status: "pending_member_approval" },
  });
  return n > 0;
};

exports.withdrawPendingForVehicleExcept = (vehicleId, exceptAssignmentId) =>
  SourcingVehicleAssignment.update(
    { status: "withdrawn" },
    {
      where: {
        vehicleId,
        status: "pending_member_approval",
        id: { [Op.ne]: exceptAssignmentId },
      },
    },
  );

exports.findPendingVehicleIdsForMember = async (memberId) => {
  const rows = await SourcingVehicleAssignment.findAll({
    attributes: ["vehicleId"],
    where: { status: "pending_member_approval" },
    include: [
      {
        model: SourcingRequest,
        as: "sourcingRequest",
        attributes: [],
        where: { memberId: Number(memberId) },
        required: true,
      },
    ],
    raw: true,
  });
  return [...new Set(rows.map((row) => row.vehicleId))];
};

exports.countPendingForVehicle = (vehicleId) =>
  SourcingVehicleAssignment.count({
    where: { vehicleId, status: "pending_member_approval" },
  });
