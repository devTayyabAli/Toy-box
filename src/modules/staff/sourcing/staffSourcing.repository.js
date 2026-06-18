"use strict";

const { Op } = require("sequelize");
const {
  SourcingRequest,
  SourcingVehicleAssignment,
  Vehicle,
  Member,
} = require("../../../models");

const PENDING_CONFIRM_STATUSES = [
  "Request received",
  "Searching for vehicle",
  "Vehicle found",
  "Inspection in progress",
];

const IN_REVIEW_STATUSES = ["Inspection in progress", "Offer ready"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

exports.countSummary = async () => {
  const dayStart = startOfToday();
  const dayEnd = endOfToday();

  const [pendingConfirm, signOffQueue, completedToday, inReview] = await Promise.all([
    SourcingRequest.count({
      where: { status: { [Op.in]: PENDING_CONFIRM_STATUSES } },
    }),
    SourcingVehicleAssignment.count({
      where: { status: "pending_member_approval" },
    }),
    SourcingRequest.count({
      where: {
        status: "Completed",
        completedAt: { [Op.between]: [dayStart, dayEnd] },
      },
    }),
    SourcingRequest.count({
      where: { status: { [Op.in]: IN_REVIEW_STATUSES } },
    }),
  ]);

  const workload = pendingConfirm + signOffQueue + completedToday;
  const shiftProgress = workload
    ? Math.min(100, Math.round((completedToday / workload) * 100))
    : 0;

  return {
    pendingConfirm: {
      value: pendingConfirm,
      subtitle: "Awaiting your action",
    },
    signOffQueue: {
      value: signOffQueue,
      subtitle: "Offers awaiting member sign-off",
    },
    completedToday: {
      value: completedToday,
      subtitle: "Completed today",
    },
    shiftProgress: {
      value: shiftProgress,
      unit: "percent",
    },
    inReview: {
      value: inReview,
      subtitle: "Bookings in review",
    },
  };
};

exports.mapPendingAssignments = async (sourcingRequestIds) => {
  if (!sourcingRequestIds.length) return new Map();

  const rows = await SourcingVehicleAssignment.findAll({
    where: {
      sourcingRequestId: { [Op.in]: sourcingRequestIds },
      status: "pending_member_approval",
    },
    include: [{ model: Vehicle, as: "vehicle" }],
    order: [["assignedAt", "DESC"]],
  });

  const map = new Map();
  for (const row of rows) {
    const plain = row.get ? row.get({ plain: true }) : row;
    if (!map.has(plain.sourcingRequestId)) {
      map.set(plain.sourcingRequestId, plain);
    }
  }
  return map;
};

function memberDisplayName(member) {
  if (!member) return null;
  const m = member.get ? member.get({ plain: true }) : member;
  return (
    [m.firstName, m.lastName].filter(Boolean).join(" ") ||
    m.name ||
    m.email ||
    null
  );
}

exports.listInReviewBookings = async (limit = 20) => {
  const rows = await SourcingVehicleAssignment.findAll({
    where: { status: "pending_member_approval" },
    include: [
      { model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "year", "imageUrl"] },
      {
        model: SourcingRequest,
        as: "sourcingRequest",
        attributes: ["id", "referenceNumber", "status", "memberId"],
        include: [
          {
            model: Member,
            as: "member",
            attributes: ["id", "firstName", "lastName", "name", "email", "profileImageUrl"],
          },
        ],
      },
    ],
    order: [["assignedAt", "DESC"]],
    limit: Math.min(limit, 50),
  });

  return rows.map((row) => {
    const plain = row.get ? row.get({ plain: true }) : row;
    const request = plain.sourcingRequest;
    const vehicle = plain.vehicle;
    const member = request?.member;

    return {
      id: plain.id,
      sourcingRequestId: plain.sourcingRequestId,
      referenceNumber: request?.referenceNumber || null,
      member: member
        ? {
            id: member.id,
            name: memberDisplayName(member),
            profileImageUrl: member.profileImageUrl || null,
          }
        : null,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            displayName: [vehicle.make, vehicle.model].filter(Boolean).join(" "),
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            imageUrl: vehicle.imageUrl || null,
          }
        : null,
      offerStartDate: plain.offerStartDate || null,
      offerEndDate: plain.offerEndDate || null,
      preferredDates:
        plain.offerStartDate || plain.offerEndDate
          ? { start: plain.offerStartDate || null, end: plain.offerEndDate || null }
          : null,
      status: plain.status,
      assignedAt: plain.assignedAt,
    };
  });
};

exports.loadRequestForOffer = async (requestId) =>
  SourcingRequest.findByPk(requestId, {
    include: [
      {
        model: Member,
        as: "member",
        attributes: ["id", "firstName", "lastName", "name", "email", "profileImageUrl"],
      },
    ],
  });

exports.listInventoryVehiclesForOffer = () =>
  Vehicle.findAll({
    where: { ownershipType: "inventory", registrationStep: "complete" },
    attributes: ["id", "make", "model", "year", "imageUrl", "status"],
    order: [
      ["make", "ASC"],
      ["model", "ASC"],
    ],
    limit: 100,
  });
