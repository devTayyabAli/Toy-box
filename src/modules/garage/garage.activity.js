const { Op } = require("sequelize");
const {
  Request,
  MaintenanceRequest,
  TransportRequest,
  Booking,
  Vehicle,
} = require("../../models");
const { REQUEST_TYPE_LABELS } = require("./garage.constants");
const { displayName } = require("./garage.formatter");
const { SERVICE_TYPE } = require("../detailing/detailing.constants");

function normalizeActivity(row) {
  return {
    id: `${row.source}-${row.id}`,
    sourceId: row.id,
    source: row.source,
    type: row.type,
    title: row.title,
    status: row.status,
    vehicleId: row.vehicleId,
    vehicleLabel: row.vehicleLabel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function loadGarageRequests({ memberId, vehicleId, tab, type, limit = 50 }) {
  const statusFilter =
    tab === "active"
      ? { [Op.notIn]: ["Completed", "Cancelled"] }
      : tab === "past"
        ? { [Op.in]: ["Completed", "Cancelled"] }
        : undefined;

  const where = {};
  if (memberId) where.memberId = memberId;
  if (vehicleId) where.vehicleId = vehicleId;
  if (type) where.type = type;
  if (statusFilter) where.status = statusFilter;

  const garageRows = await Request.findAll({
    where,
    include: [
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "make", "model", "year", "imageUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  });

  const items = garageRows.map((r) => {
    const plain = r.get({ plain: true });
    return normalizeActivity({
      id: plain.id,
      source: "garage_request",
      type: plain.type,
      title: plain.title || REQUEST_TYPE_LABELS[plain.type] || "Request",
      status: plain.status,
      vehicleId: plain.vehicleId,
      vehicleLabel: plain.vehicle ? displayName(plain.vehicle) : null,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  });

  if (vehicleId || memberId) {
    const mWhere = {};
    if (memberId) mWhere.memberId = memberId;
    if (vehicleId) mWhere.vehicleId = vehicleId;

    const maintenance = await MaintenanceRequest.findAll({
      where: mWhere,
      include: [{ model: Vehicle, as: "vehicle" }],
      order: [["createdAt", "DESC"]],
      limit,
    });

    for (const row of maintenance) {
      const plain = row.get({ plain: true });
      const st = plain.status;
      if (tab === "active" && ["Completed", "Cancelled"].includes(st)) continue;
      if (tab === "past" && !["Completed", "Cancelled"].includes(st)) continue;

      items.push(
        normalizeActivity({
          id: plain.id,
          source: "maintenance",
          type: "maintenance_service",
          title: `Maintenance — ${plain.referenceNumber || plain.id}`,
          status: plain.status,
          vehicleId: plain.vehicleId,
          vehicleLabel: plain.vehicle ? displayName(plain.vehicle) : null,
          createdAt: plain.createdAt,
          updatedAt: plain.updatedAt,
        }),
      );
    }

    const transport = await TransportRequest.findAll({
      where: mWhere,
      order: [["createdAt", "DESC"]],
      limit,
    });
    for (const row of transport) {
      const plain = row.get({ plain: true });
      if (tab === "active" && ["Completed", "Cancelled"].includes(plain.status)) continue;
      if (tab === "past" && !["Completed", "Cancelled"].includes(plain.status)) continue;
      items.push(
        normalizeActivity({
          id: plain.id,
          source: "transport",
          type: "transport_delivery",
          title: plain.referenceNumber || "Transport request",
          status: plain.status,
          vehicleId: plain.vehicleId,
          vehicleLabel: null,
          createdAt: plain.createdAt,
          updatedAt: plain.updatedAt,
        }),
      );
    }

    const bookings = await Booking.findAll({
      where: { ...mWhere, serviceType: SERVICE_TYPE },
      include: [{ model: Vehicle, as: "vehicle" }],
      order: [["createdAt", "DESC"]],
      limit,
    });
    for (const row of bookings) {
      const plain = row.get({ plain: true });
      if (tab === "active" && ["Completed", "Cancelled"].includes(plain.status)) continue;
      if (tab === "past" && !["Completed", "Cancelled"].includes(plain.status)) continue;
      items.push(
        normalizeActivity({
          id: plain.id,
          source: "detailing",
          type: "detailing_wash",
          title: plain.referenceNumber || "Detailing booking",
          status: plain.status,
          vehicleId: plain.vehicleId,
          vehicleLabel: plain.vehicle ? displayName(plain.vehicle) : null,
          createdAt: plain.createdAt,
          updatedAt: plain.updatedAt,
        }),
      );
    }
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items.slice(0, limit);
}

exports.loadGarageRequests = loadGarageRequests;

exports.loadRecentActions = async (vehicleId, limit = 10) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return [];
  return loadGarageRequests({
    vehicleId,
    memberId: vehicle.memberId,
    limit,
  });
};
