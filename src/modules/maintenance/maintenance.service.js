const crypto = require("crypto");
const { Op } = require("sequelize");
const AppError = require("../../utils/AppError");
const { Vehicle } = require("../../models");
const { calculateTotal, LOCATIONS, SERVICE_TYPES } = require("./maintenance.data");
const {
  buildInitialTimeline,
  buildChecklist,
  applyLineItemsForApproval,
  nowIso,
} = require("./maintenance.timeline");
const maintenanceRepository = require("./maintenance.repository");
const { toSummary, toStatus, toApproval, toJobDetail } = require("./maintenance.formatter");

function ref(prefix) {
  const a = crypto.randomInt(1000, 9999);
  const b = crypto.randomInt(1000, 9999);
  return `${prefix} - ${a} - ${b}`;
}

async function uniqueRef() {
  for (let i = 0; i < 5; i += 1) {
    const referenceNumber = ref("MNT");
    if (!(await maintenanceRepository.refExists(referenceNumber))) {
      return referenceNumber;
    }
  }
  throw new AppError("Could not generate reference", 500);
}

exports.getServiceTypes = () => ({ serviceTypes: SERVICE_TYPES });
exports.getLocations = () => ({ locations: LOCATIONS });
exports.getCatalog = () => ({
  serviceTypes: SERVICE_TYPES,
  locations: LOCATIONS,
});

exports.estimate = (body) => {
  const pricing = calculateTotal(body.serviceKeys);
  if (!pricing) throw new AppError("Select at least one service", 400);
  return { ...pricing, totalAmount: pricing.subtotalAed };
};

exports.review = async (body) => {
  const vehicle = await Vehicle.findByPk(body.vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  const estimate = exports.estimate(body);
  const location = LOCATIONS.find((l) => l.key === body.locationKey);
  return {
    review: {
      vehicle: [vehicle.make, vehicle.model].filter(Boolean).join(" "),
      services: estimate.services,
      scheduledAt: body.scheduledAt,
      location: location?.name,
      notes: body.notes || null,
      totalAmount: estimate.totalAmount,
      currency: "AED",
    },
  };
};

exports.createRequest = async (body) => {
  const vehicle = await Vehicle.findByPk(body.vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  const pricing = calculateTotal(body.serviceKeys);
  if (!pricing) throw new AppError("Select at least one service", 400);

  const row = await maintenanceRepository.create({
    referenceNumber: await uniqueRef(),
    status: "Request sent",
    memberId: body.memberId,
    vehicleId: body.vehicleId,
    serviceKeys: body.serviceKeys,
    scheduledAt: body.scheduledAt,
    locationKey: body.locationKey,
    notes: body.notes || null,
    documentUrls: body.documentUrls || [],
    timeline: buildInitialTimeline(),
    workCompleted: buildChecklist(body.serviceKeys),
    currency: "AED",
  });

  const full = await maintenanceRepository.findById(row.id);
  return {
    ...toSummary(full),
    message: "Your maintenance request has been submitted.",
  };
};

exports.listRequests = async (query) => {
  const where = {};
  if (query.memberId) where.memberId = query.memberId;
  if (query.status) where.status = query.status;
  const rows = await maintenanceRepository.findAll(where, query.limit || 20);
  return { count: rows.length, requests: rows.map(toSummary) };
};

exports.getRequest = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  return toSummary(row);
};

exports.getStatus = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  return toStatus(row);
};

exports.getApproval = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  if (!["Awaiting approval", "Ready for delivery", "Completed"].includes(row.status)) {
    throw new AppError("Approval quote not ready yet", 400);
  }
  return toApproval(row);
};

exports.approveAndPay = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  if (row.status !== "Awaiting approval") {
    throw new AppError("Request is not awaiting approval", 400);
  }

  const { isStripeEnabled } = require("../../config/stripe");
  if (isStripeEnabled()) {
    const stripeService = require("../stripe/stripe.service");
    const checkout = await stripeService.createCheckoutSession({
      memberId: row.memberId,
      purpose: "maintenance",
      referenceId: Number(id),
    });
    return { paymentRequired: true, ...checkout };
  }

  const timeline = (row.timeline || []).map((s) =>
    s.key === "awaiting_approval"
      ? { ...s, status: "completed", completedAt: nowIso() }
      : s,
  );
  const next = timeline.find((s) => s.key === "ready_for_delivery");
  if (next) next.status = "active";

  const updated = await maintenanceRepository.update(id, {
    status: "Ready for delivery",
    timeline,
    approvedAt: new Date(),
    paidAt: new Date(),
  });
  return toSummary(updated);
};

exports.cancel = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  if (["Completed", "Cancelled"].includes(row.status)) {
    throw new AppError("Cannot cancel this request", 400);
  }
  const updated = await maintenanceRepository.update(id, { status: "Cancelled" });
  return toStatus(updated);
};

exports.updateRequest = async (id, body) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);
  if (row.status !== "Request sent") {
    throw new AppError("Can only edit before pickup", 400);
  }
  const patch = { ...body };
  if (body.serviceKeys) {
    patch.workCompleted = buildChecklist(body.serviceKeys);
  }
  const updated = await maintenanceRepository.update(id, patch);
  return toSummary(updated);
};

exports.listJobs = async (query) => {
  const where = {};
  if (query.status) {
    where.status = query.status;
  } else {
    where.status = {
      [Op.in]: ["Service in progress", "Ready for delivery", "Awaiting approval"],
    };
  }
  const rows = await maintenanceRepository.findAll(where, query.limit);
  return { jobs: rows.map(toJobDetail) };
};

exports.getJob = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Job not found", 404);
  return toJobDetail(row);
};

exports.updateJobStatus = async (id, status) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Job not found", 404);
  const patch = { status };
  if (status === "Completed") {
    patch.completedAt = new Date();
    patch.workCompleted = (row.workCompleted || []).map((i) => ({ ...i, done: true }));
  }
  const updated = await maintenanceRepository.update(id, patch);
  return toJobDetail(updated);
};

exports.updateChecklist = async (id, items) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Job not found", 404);
  const map = Object.fromEntries(items.map((i) => [i.key, i.done]));
  const workCompleted = (row.workCompleted || []).map((item) => ({
    ...item,
    done: map[item.key] !== undefined ? map[item.key] : item.done,
  }));
  const updated = await maintenanceRepository.update(id, { workCompleted });
  return toJobDetail(updated);
};

exports.simulateProgress = async (id) => {
  const row = await maintenanceRepository.findById(id);
  if (!row) throw new AppError("Maintenance request not found", 404);

  const timeline = [...(row.timeline || [])];
  const idx = timeline.findIndex((s) => s.status === "pending" || s.status === "active");
  if (idx === -1) throw new AppError("Timeline already complete", 400);

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
    vehicle_picked_up: "Vehicle picked up",
    service_in_progress: "Service in progress",
    awaiting_approval: "Awaiting approval",
    ready_for_delivery: "Ready for delivery",
    completed: "Completed",
  };

  const patch = {
    timeline,
    status: statusMap[step.key] || row.status,
    assignedStaff: { name: "James T.", role: "Service advisor" },
  };

  if (step.key === "awaiting_approval") {
    const quote = applyLineItemsForApproval(row.serviceKeys);
    patch.lineItems = quote.lineItems;
    patch.totalAmount = quote.totalAmount;
  }
  if (isLast) {
    patch.completedAt = new Date();
    patch.workCompleted = (row.workCompleted || []).map((i) => ({ ...i, done: true }));
  }

  const updated = await maintenanceRepository.update(id, patch);
  if (step.key === "awaiting_approval") return toApproval(updated);
  if (isLast) return toSummary(updated);
  return toStatus(updated);
};
