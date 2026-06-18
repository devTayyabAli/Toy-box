const AppError = require("../../utils/AppError");
const {
  Booking,
  Request,
  MaintenanceRequest,
  SourcingRequest,
  TransportRequest,
  Vehicle,
} = require("../../models");
const { SERVICE_TYPE } = require("../detailing/detailing.constants");

const COMPLETED = new Set([
  "Completed",
  "Cancelled",
  "cancelled",
]);

const CANCELLED = new Set(["Cancelled", "cancelled"]);

function vehicleLabel(v) {
  if (!v) return null;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function classify(status) {
  if (CANCELLED.has(status)) return "cancelled";
  if (COMPLETED.has(status)) return "completed";
  return "active";
}

exports.listMyBookings = async ({ memberId, tab, limit = 50 }) => {
  if (!memberId) {
    throw new AppError("memberId is required", 400);
  }

  const [detailing, garageRequests, maintenance, transport, sourcing] = await Promise.all([
    Booking.findAll({
      where: { memberId, serviceType: SERVICE_TYPE },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model"] }],
      order: [["createdAt", "DESC"]],
    }),
    Request.findAll({
      where: { memberId },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model"] }],
      order: [["createdAt", "DESC"]],
    }),
    MaintenanceRequest.findAll({
      where: { memberId },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model"] }],
      order: [["createdAt", "DESC"]],
    }),
    TransportRequest.findAll({
      where: { memberId },
      include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "make", "model"] }],
      order: [["createdAt", "DESC"]],
    }),
    SourcingRequest.findAll({
      where: { memberId },
      order: [["createdAt", "DESC"]],
    }),
  ]);

  const items = [];

  for (const b of detailing) {
    const v = b.vehicle;
    items.push({
      id: b.id,
      source: "detailing",
      referenceNumber: b.referenceNumber,
      title: `Detailing — ${vehicleLabel(v)}`,
      status: b.status,
      tab: classify(b.status),
      vehicleId: b.vehicleId,
      scheduledAt: b.scheduledDate || b.startDate,
      totalAmount: b.totalEstimate,
      currency: b.currency,
      createdAt: b.createdAt,
    });
  }

  for (const r of garageRequests) {
    const v = r.vehicle;
    items.push({
      id: r.id,
      source: "garage_request",
      referenceNumber: null,
      title: r.title || `${r.type} — ${vehicleLabel(v)}`,
      status: r.status,
      tab: classify(r.status),
      vehicleId: r.vehicleId,
      type: r.type,
      scheduledAt: r.scheduledAt,
      createdAt: r.createdAt,
    });
  }

  for (const m of maintenance) {
    const v = m.vehicle;
    items.push({
      id: m.id,
      source: "maintenance",
      referenceNumber: m.referenceNumber,
      title: `Maintenance — ${vehicleLabel(v)}`,
      status: m.status,
      tab: classify(m.status),
      vehicleId: m.vehicleId,
      scheduledAt: m.scheduledAt,
      totalAmount: m.totalAmount,
      currency: m.currency,
      createdAt: m.createdAt,
    });
  }

  for (const t of transport) {
    const v = t.vehicle;
    items.push({
      id: t.id,
      source: "transport",
      referenceNumber: t.referenceNumber,
      title: `Transport — ${vehicleLabel(v)}`,
      status: t.status,
      tab: classify(t.status),
      vehicleId: t.vehicleId,
      scheduledAt: t.scheduledAt,
      pickupLocation: t.pickupLocation,
      dropoffLocation: t.dropoffLocation,
      createdAt: t.createdAt,
    });
  }

  for (const s of sourcing) {
    items.push({
      id: s.id,
      source: "sourcing",
      referenceNumber: s.referenceNumber,
      title: `Sourcing — ${s.make} ${s.model}`,
      status: s.status,
      tab: classify(s.status),
      scheduledAt: null,
      createdAt: s.createdAt,
    });
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered =
    tab && tab !== "all" ? items.filter((i) => i.tab === tab) : items;

  return {
    tab: tab || "all",
    count: filtered.length,
    items: filtered.slice(0, limit),
  };
};
