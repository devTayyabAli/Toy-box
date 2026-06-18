const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const { Vehicle } = require("../../models");
const transportRepository = require("./transport.repository");
const { toSummary, vehicleLabel } = require("./transport.formatter");
const { buildInitialTimeline, nowIso } = require("./transport.timeline");
const { INITIAL_STATUS, TRANSPORT_SERVICE_TYPES } = require("./transport.constants");
const {
  normalizeTransportCreateBody,
  assertNormalizedPayload,
  buildReviewSummary,
} = require("./transport.mapper");
const { resolveMemberRef } = require("../../utils/resolveMemberRef");
const requestsHub = require("../requestsHub/requestsHub.service");
const { notifyMember } = require("../notifications/notifications.dispatch");

async function uniqueRef() {
  const year = new Date().getFullYear();
  const mmdd = `${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}`;
  for (let i = 0; i < 8; i += 1) {
    const seq = String(crypto.randomInt(100, 999));
    const referenceNumber = `TB - ${year} - ${mmdd} - ${seq}`;
    if (!(await transportRepository.refExists(referenceNumber))) {
      return referenceNumber;
    }
  }
  throw new AppError("Could not generate reference", 500);
}

async function preparePayload(body) {
  const member = await resolveMemberRef(body.memberId);
  const normalized = normalizeTransportCreateBody({
    ...body,
    memberId: member.id,
  });
  assertNormalizedPayload(normalized);
  return { ...normalized, memberNumber: member.memberNumber };
}

exports.listServiceTypes = () => ({
  options: Object.values(TRANSPORT_SERVICE_TYPES),
});

exports.review = async (body) => {
  const payload = await preparePayload(body);
  const vehicle = await Vehicle.findByPk(payload.vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  return {
    review: buildReviewSummary(payload, vehicle),
  };
};

exports.create = async (body) => {
  const payload = await preparePayload(body);
  const vehicle = await Vehicle.findByPk(payload.vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const row = await transportRepository.create({
    referenceNumber: await uniqueRef(),
    status: INITIAL_STATUS,
    memberId: payload.memberId,
    vehicleId: payload.vehicleId,
    serviceType: payload.serviceType,
    pickupLocation: payload.pickupLocation,
    dropoffLocation: payload.dropoffLocation,
    deliveryAddress: payload.deliveryAddress,
    scheduledDate: payload.scheduledDate,
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    scheduledAt: payload.scheduledAt,
    notes: payload.notes || null,
    timeline: buildInitialTimeline(),
    assignedStaff: { name: "James T.", role: "Concierge" },
  });

  const full = await transportRepository.findById(row.id);
  const summary = toSummary(full);

  notifyMember(payload.memberId, {
    type: "transport",
    title: "Transport request submitted",
    body: `${summary.referenceNumber} — ${INITIAL_STATUS}`,
    data: {
      source: "transport",
      requestId: String(full.id),
      referenceNumber: summary.referenceNumber,
      status: INITIAL_STATUS,
    },
  }).catch(() => {});

  return {
    ...summary,
    message: "Your transport request has been submitted.",
    statusLabel: INITIAL_STATUS,
  };
};

exports.list = async (query) => {
  if (query.unified !== false) {
    return requestsHub.listUnified(query);
  }

  const where = {};
  if (query.memberId) {
    const member = await resolveMemberRef(query.memberId);
    where.memberId = member.id;
  }
  if (query.status) where.status = query.status;
  const rows = await transportRepository.findAll(where, query.limit);
  return { unified: false, count: rows.length, requests: rows.map(toSummary) };
};

exports.getById = async (id, query = {}) => {
  if (query.referenceNumber) {
    const item = await requestsHub.findByReference(query.referenceNumber, query.memberId);
    if (!item) throw new AppError("Request not found", 404);
    return item;
  }

  if (query.source && query.source !== "transport") {
    return requestsHub.getBySourceId(query.source, id, query.memberId);
  }

  const row = await transportRepository.findById(id);
  if (!row) throw new AppError("Transport request not found", 404);
  return toSummary(row);
};

exports.getStatus = async (id) => {
  const row = await transportRepository.findById(id);
  if (!row) throw new AppError("Transport request not found", 404);
  return toSummary(row);
};

exports.cancel = async (id) => {
  const row = await transportRepository.findById(id);
  if (!row) throw new AppError("Transport request not found", 404);
  if (["Completed", "Cancelled"].includes(row.status)) {
    throw new AppError("Cannot cancel", 400);
  }
  const updated = await transportRepository.update(id, { status: "Cancelled" });
  const summary = toSummary(updated);

  notifyMember(row.memberId, {
    type: "transport",
    title: "Transport request cancelled",
    body: summary.referenceNumber,
    data: {
      source: "transport",
      requestId: String(id),
      referenceNumber: summary.referenceNumber,
      status: "Cancelled",
    },
  }).catch(() => {});

  return summary;
};

exports.simulateProgress = async (id) => {
  const row = await transportRepository.findById(id);
  if (!row) throw new AppError("Transport request not found", 404);

  const timeline = [...(row.timeline || [])];
  const idx = timeline.findIndex((s) => s.status === "pending" || s.status === "active");
  if (idx === -1) throw new AppError("Timeline complete", 400);

  if (idx > 0 && timeline[idx - 1].status === "active") {
    timeline[idx - 1] = { ...timeline[idx - 1], status: "completed", completedAt: nowIso() };
  }

  const step = timeline[idx];
  const isLast = step.key === "completed";
  timeline[idx] = {
    ...step,
    status: isLast ? "completed" : "active",
    completedAt: isLast ? nowIso() : null,
  };

  const statusMap = {
    request_sent: "Request sent",
    confirmed: "Confirmed",
    vehicle_picked_up: "Vehicle picked up",
    in_transit: "In transit",
    delivered: "Delivered",
    completed: "Completed",
  };

  const patch = {
    timeline,
    status: statusMap[step.key] || row.status,
  };
  if (isLast) patch.completedAt = new Date();

  const updated = await transportRepository.update(id, patch);
  const summary = toSummary(updated);

  notifyMember(row.memberId, {
    type: "vehicle_status",
    title: "Transport status updated",
    body: `${summary.referenceNumber} — ${patch.status}`,
    data: {
      source: "transport",
      requestId: String(id),
      referenceNumber: summary.referenceNumber,
      status: patch.status,
    },
  }).catch(() => {});

  return summary;
};
