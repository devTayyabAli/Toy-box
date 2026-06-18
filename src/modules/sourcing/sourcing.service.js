const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const sourcingRepository = require("./sourcing.repository");
const { toSummary, toStatus, toReview, toAdminSummary } = require("./sourcing.formatter");
const { buildInitialTimeline, sampleMatches, nowIso } = require("./sourcing.timeline");

const OVERVIEW = {
  title: "Vehicle Sourcing",
  description:
    "Our concierge team sources rare and specific vehicles to your exact specifications, budget, and timeline.",
  features: [
    "Global dealer and private seller network",
    "Pre-purchase inspection and history reports",
    "Negotiation and purchase on your behalf",
  ],
};

function ref() {
  return `SRC - ${crypto.randomInt(1000, 9999)} - ${crypto.randomInt(1000, 9999)}`;
}

async function uniqueRef() {
  for (let i = 0; i < 5; i += 1) {
    const referenceNumber = ref();
    if (!(await sourcingRepository.refExists(referenceNumber))) return referenceNumber;
  }
  throw new AppError("Could not generate reference", 500);
}

exports.getOverview = () => OVERVIEW;

exports.review = (body) => ({ review: toReview(body) });

exports.createRequest = async (body) => {
  const row = await sourcingRepository.create({
    referenceNumber: await uniqueRef(),
    status: "Request received",
    memberId: body.memberId,
    make: body.make,
    model: body.model,
    yearMin: body.yearMin,
    yearMax: body.yearMax,
    colour: body.colour,
    trim: body.trim,
    specifications: body.specifications || {},
    budgetMin: body.budgetMin,
    budgetMax: body.budgetMax,
    currency: body.currency || "AED",
    timelineNotes: body.timelineNotes,
    notes: body.notes,
    timeline: buildInitialTimeline(),
    matches: [],
  });

  const full = await sourcingRepository.findById(row.id);
  return {
    ...toSummary(full),
    message: "Your sourcing request has been submitted.",
  };
};

function parseLimit(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 100);
}

function parseOffset(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

exports.listRequests = async (query) => {
  const where = {};
  if (query.memberId) where.memberId = query.memberId;
  if (query.status) where.status = query.status;
  const limit = parseLimit(query.limit, 20);
  const offset = parseOffset(query.offset);
  const [total, rows] = await Promise.all([
    sourcingRepository.countAll(where),
    sourcingRepository.findAll(where, { limit, offset }),
  ]);
  return {
    total,
    count: rows.length,
    limit,
    offset,
    requests: rows.map(toSummary),
  };
};

exports.listRequestsForAdmin = async (query) => {
  const { Op } = require("sequelize");
  const { Member } = require("../../models");
  const where = {};
  if (query.memberId) where.memberId = query.memberId;
  if (query.status) where.status = query.status;
  if (query.search) {
    const q = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { referenceNumber: { [Op.iLike]: q } },
      { make: { [Op.iLike]: q } },
      { model: { [Op.iLike]: q } },
    ];
  }
  const limit = parseLimit(query.limit, 50);
  const offset = parseOffset(query.offset);
  const memberInclude = {
    model: Member,
    as: "member",
    attributes: ["id", "name", "email", "firstName", "lastName"],
  };
  const [total, rows] = await Promise.all([
    sourcingRepository.countAll(where),
    sourcingRepository.findAll(where, { limit, offset, include: [memberInclude] }),
  ]);
  return {
    total,
    count: rows.length,
    limit,
    offset,
    requests: rows.map(toAdminSummary),
  };
};

exports.getRequest = async (id) => {
  const row = await sourcingRepository.findById(id);
  if (!row) throw new AppError("Sourcing request not found", 404);
  return toSummary(row);
};

exports.getStatus = async (id) => {
  const row = await sourcingRepository.findById(id);
  if (!row) throw new AppError("Sourcing request not found", 404);
  return toStatus(row);
};

exports.cancel = async (id) => {
  const row = await sourcingRepository.findById(id);
  if (!row) throw new AppError("Sourcing request not found", 404);
  if (["Completed", "Cancelled"].includes(row.status)) {
    throw new AppError("Cannot cancel", 400);
  }
  const updated = await sourcingRepository.update(id, { status: "Cancelled" });
  return toStatus(updated);
};

exports.simulateProgress = async (id) => {
  const row = await sourcingRepository.findById(id);
  if (!row) throw new AppError("Sourcing request not found", 404);

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
    request_received: "Request received",
    searching: "Searching for vehicle",
    vehicle_found: "Vehicle found",
    inspection_in_progress: "Inspection in progress",
    offer_ready: "Offer ready",
    completed: "Completed",
  };

  const patch = {
    timeline,
    status: statusMap[step.key] || row.status,
  };

  if (step.key === "vehicle_found") {
    patch.matches = sampleMatches(row.make, row.model);
  }
  if (isLast) {
    patch.completedAt = new Date();
  }

  const updated = await sourcingRepository.update(id, patch);
  return toStatus(updated);
};
