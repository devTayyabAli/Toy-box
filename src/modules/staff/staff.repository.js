"use strict";

const { Op } = require("sequelize");
const {
  Member,
  Role,
  Vehicle,
  Request,
  Booking,
  MaintenanceRequest,
  TransportRequest,
  SourcingRequest,
  SourcingVehicleAssignment,
} = require("../../models");
const {
  STORED_STATUSES,
  OPEN_REQUEST_STATUSES,
  STORAGE_TOTAL_BAYS,
} = require("./staff.constants");
const firebaseChatService = require("../../services/firebaseChat.service");
const firebaseConfig = require("../../config/firebase");

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

function startOfYesterday() {
  const d = startOfToday();
  d.setDate(d.getDate() - 1);
  return d;
}

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ").trim() || `Vehicle #${v.id}`;
}

exports.loadStaffMember = (id) =>
  Member.findByPk(id, {
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
  });

exports.countMembersInClub = () =>
  Member.count({
    include: [{ model: Role, as: "role", where: { name: "member" }, required: true }],
    where: { mustChangePassword: false },
  });

exports.countMembersJoinedSince = (since) =>
  Member.count({
    include: [{ model: Role, as: "role", where: { name: "member" }, required: true }],
    where: {
      mustChangePassword: false,
      createdAt: { [Op.gte]: since },
    },
  });

exports.countVehiclesStored = () =>
  Vehicle.count({
    where: {
      registrationStep: "complete",
      status: { [Op.in]: STORED_STATUSES },
    },
  });

exports.countPendingIntake = () =>
  Vehicle.count({
    where: {
      registrationStep: "complete",
      [Op.or]: [
        { status: { [Op.in]: ["In review", "In Review"] } },
        { ownershipType: "inventory", memberId: { [Op.ne]: null } },
      ],
    },
  });

exports.countOpenRequests = async () => {
  const [garage, maintenance, transport, detailing, sourcing] = await Promise.all([
    Request.count({ where: { status: { [Op.in]: OPEN_REQUEST_STATUSES.garage } } }),
    MaintenanceRequest.count({ where: { status: { [Op.in]: OPEN_REQUEST_STATUSES.maintenance } } }),
    TransportRequest.count({ where: { status: { [Op.in]: OPEN_REQUEST_STATUSES.transport } } }),
    Booking.count({ where: { status: { [Op.in]: OPEN_REQUEST_STATUSES.detailing } } }),
    SourcingRequest.count({ where: { status: { [Op.in]: OPEN_REQUEST_STATUSES.sourcing } } }),
  ]);
  return garage + maintenance + transport + detailing + sourcing;
};

exports.countCriticalOpenRequests = () =>
  Request.count({
    where: {
      status: { [Op.in]: OPEN_REQUEST_STATUSES.garage },
      scheduledAt: { [Op.lte]: new Date() },
    },
  });

exports.countOccupiedBays = () =>
  Vehicle.count({
    where: {
      registrationStep: "complete",
      storageBay: { [Op.ne]: null },
    },
  });

exports.countInspectionsPending = () =>
  Vehicle.count({
    where: {
      registrationStep: "complete",
      status: { [Op.in]: ["In Service", "In Progress", "Service in progress", "Available", "Stored"] },
    },
  });

exports.countPhotoUploadsPending = () =>
  Vehicle.count({
    where: {
      registrationStep: "complete",
      [Op.or]: [{ imageUrl: null }, { imageUrl: "" }],
    },
  });

exports.countConfirmationsPending = async () => {
  const [transport, detailing, assignments] = await Promise.all([
    TransportRequest.count({ where: { status: "Awaiting confirmation" } }),
    Booking.count({ where: { status: "Awaiting confirmation" } }),
    SourcingVehicleAssignment.count({ where: { status: "pending_member_approval" } }),
  ]);
  return transport + detailing + assignments;
};

exports.sumConciergeUnread = async () => {
  if (!firebaseConfig.enabled) return 0;
  try {
    const { conversations } = await firebaseChatService.listConversations({ limit: 100 });
    return conversations.reduce((sum, c) => sum + (c.unreadForAdmin || 0), 0);
  } catch {
    return 0;
  }
};

exports.listStaffOnDuty = () =>
  Member.findAll({
    include: [{ model: Role, as: "role", where: { name: { [Op.in]: ["staff", "admin"] } }, required: true }],
    where: { mustChangePassword: false },
    attributes: ["id", "firstName", "lastName", "name", "jobTitle", "profileImageUrl"],
    order: [["firstName", "ASC"]],
    limit: 30,
  });

exports.listVehiclesForAlerts = () =>
  Vehicle.findAll({
    where: { registrationStep: "complete" },
    attributes: ["id", "make", "model", "status", "storageBay", "health", "lastServicedAt"],
    limit: 200,
    order: [["updatedAt", "DESC"]],
  });

exports.listTodayWorkItems = async () => {
  const dayStart = startOfToday();
  const dayEnd = endOfToday();

  const [requests, maintenance, transport, bookings] = await Promise.all([
    Request.findAll({
      where: { scheduledAt: { [Op.between]: [dayStart, dayEnd] } },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "storageBay"] }],
      order: [["scheduledAt", "ASC"]],
      limit: 30,
    }),
    MaintenanceRequest.findAll({
      where: { scheduledAt: { [Op.between]: [dayStart, dayEnd] } },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "storageBay"] }],
      order: [["scheduledAt", "ASC"]],
      limit: 30,
    }),
    TransportRequest.findAll({
      where: {
        [Op.or]: [
          { scheduledAt: { [Op.between]: [dayStart, dayEnd] } },
          { scheduledDate: dayStart.toISOString().slice(0, 10) },
        ],
      },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "storageBay"] }],
      order: [["scheduledAt", "ASC"]],
      limit: 30,
    }),
    Booking.findAll({
      where: { startDate: { [Op.between]: [dayStart, dayEnd] } },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model", "storageBay"] }],
      order: [["startDate", "ASC"]],
      limit: 30,
    }),
  ]);

  const items = [];

  for (const row of requests) {
    items.push({
      id: `request-${row.id}`,
      sourceType: "garage_request",
      sourceId: row.id,
      title: row.title || row.type || "Service request",
      vehicleLabel: vehicleLabel(row.vehicle),
      detail: row.notes || row.type,
      bay: row.vehicle?.storageBay || null,
      scheduledAt: row.scheduledAt,
      status: row.status,
      urgency: row.status === "In Progress" ? "in_progress" : "normal",
    });
  }

  for (const row of maintenance) {
    items.push({
      id: `maintenance-${row.id}`,
      sourceType: "maintenance",
      sourceId: row.id,
      title: "Maintenance service",
      vehicleLabel: vehicleLabel(row.vehicle),
      detail: (row.serviceKeys || []).join(", ") || row.locationKey,
      bay: row.vehicle?.storageBay || null,
      scheduledAt: row.scheduledAt,
      status: row.status,
      urgency: row.status === "Service in progress" ? "in_progress" : "normal",
    });
  }

  for (const row of transport) {
    items.push({
      id: `transport-${row.id}`,
      sourceType: "transport",
      sourceId: row.id,
      title: row.serviceType || "Transport request",
      vehicleLabel: vehicleLabel(row.vehicle),
      detail: row.dropoffLocation || row.deliveryAddress,
      bay: row.vehicle?.storageBay || null,
      scheduledAt: row.scheduledAt,
      status: row.status,
      urgency: row.status === "In transit" ? "in_progress" : "normal",
    });
  }

  for (const row of bookings) {
    items.push({
      id: `detailing-${row.id}`,
      sourceType: "detailing",
      sourceId: row.id,
      title: "Detailing booking",
      vehicleLabel: vehicleLabel(row.vehicle),
      detail: row.status,
      bay: row.vehicle?.storageBay || null,
      scheduledAt: row.startDate,
      status: row.status,
      urgency: row.status === "In Progress" ? "in_progress" : "normal",
    });
  }

  return items.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
};

exports.getShiftStatsForToday = async (staffId) => {
  const dayStart = startOfToday();
  const dayEnd = endOfToday();

  const [completedRequests, completedTransport, completedMaintenance, photosToday] = await Promise.all([
    Request.count({
      where: {
        status: "Completed",
        updatedAt: { [Op.between]: [dayStart, dayEnd] },
      },
    }),
    TransportRequest.count({
      where: {
        status: "Completed",
        completedAt: { [Op.between]: [dayStart, dayEnd] },
      },
    }),
    MaintenanceRequest.count({
      where: {
        status: { [Op.in]: ["Ready for delivery", "Completed"] },
        updatedAt: { [Op.between]: [dayStart, dayEnd] },
      },
    }),
    Vehicle.count({
      where: {
        imageUrl: { [Op.ne]: null },
        updatedAt: { [Op.between]: [dayStart, dayEnd] },
      },
    }),
  ]);

  const openToday = await exports.listTodayWorkItems();
  const totalToday = openToday.length + completedRequests + completedTransport + completedMaintenance;

  return {
    tasksCompleted: completedRequests + completedTransport + completedMaintenance,
    tasksTotal: Math.max(totalToday, completedRequests + completedTransport + completedMaintenance),
    vehiclesMoved: completedTransport,
    inspectionsDone: completedMaintenance,
    serviceConfirmations: await exports.countConfirmationsPending(),
    incidentsLogged: 0,
    photosUploaded: photosToday,
    staffId,
  };
};

exports.getMembersJoinedSinceYesterday = () => exports.countMembersJoinedSince(startOfYesterday());

exports.getStorageTotalBays = () => STORAGE_TOTAL_BAYS;
