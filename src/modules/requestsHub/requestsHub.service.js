const AppError = require("../../utils/AppError");
const {
  Booking,
  Request,
  MaintenanceRequest,
  SourcingRequest,
  TransportRequest,
  Vehicle,
  Member,
} = require("../../models");
const { SERVICE_TYPE } = require("../detailing/detailing.constants");
const { REQUEST_TYPE_LABELS } = require("../garage/garage.constants");
const { TRANSPORT_SERVICE_TYPES } = require("../transport/transport.constants");
const { toSummary: transportDetail } = require("../transport/transport.formatter");
const { toBookingSummary: detailingDetail } = require("../detailing/detailing.formatter");
const { toSummary: maintenanceDetail } = require("../maintenance/maintenance.formatter");
const { toSummary: sourcingDetail } = require("../sourcing/sourcing.formatter");
const { resolveMemberRef } = require("../../utils/resolveMemberRef");

const VEHICLE_INCLUDE = {
  model: Vehicle,
  as: "vehicle",
  attributes: ["id", "make", "model", "year", "imageUrl"],
};

const MEMBER_INCLUDE = {
  model: Member,
  as: "member",
  attributes: ["id", "memberNumber"],
};

const COMPLETED = new Set(["Completed", "Cancelled", "cancelled"]);
const CANCELLED = new Set(["Cancelled", "cancelled"]);

const SOURCE_REQUEST_TYPE = {
  transport: (row) => row.serviceType,
  detailing: () => "detailing_wash",
  maintenance: () => "maintenance_service",
  sourcing: () => "vehicle_sourcing",
  garage_request: (row) => row.type,
};

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function classifyTab(status) {
  if (CANCELLED.has(status)) return "cancelled";
  if (COMPLETED.has(status)) return "completed";
  return "active";
}

function buildTitle(source, row, vehicle) {
  const vLabel = vehicleLabel(vehicle);
  switch (source) {
    case "transport":
      return row.referenceNumber || `Transport${vLabel ? ` — ${vLabel}` : ""}`;
    case "detailing":
      return row.referenceNumber || `Detailing & Wash${vLabel ? ` — ${vLabel}` : ""}`;
    case "maintenance":
      return row.referenceNumber
        ? `Maintenance — ${row.referenceNumber}`
        : `Maintenance${vLabel ? ` — ${vLabel}` : ""}`;
    case "sourcing":
      return row.referenceNumber || `Sourcing — ${[row.make, row.model].filter(Boolean).join(" ")}`;
    case "garage_request":
      return row.title || REQUEST_TYPE_LABELS[row.type] || "Request";
    default:
      return "Request";
  }
}

function wrapItem(source, row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const requestType = SOURCE_REQUEST_TYPE[source]?.(plain) ?? plain.type ?? source;
  const requestTypeLabel =
    (source === "transport" && TRANSPORT_SERVICE_TYPES[requestType]?.label) ||
    REQUEST_TYPE_LABELS[requestType] ||
    requestType;

  let detail;
  if (source === "transport") detail = transportDetail(row);
  else if (source === "detailing") detail = detailingDetail(row);
  else if (source === "maintenance") detail = maintenanceDetail(row);
  else if (source === "sourcing") detail = sourcingDetail(row);
  else {
    detail = {
      id: plain.id,
      type: plain.type,
      title: plain.title,
      notes: plain.notes,
      status: plain.status,
      vehicleId: plain.vehicleId,
      vehicle: vehicleLabel(plain.vehicle),
      scheduledAt: plain.scheduledAt,
      createdAt: plain.createdAt,
    };
  }

  return {
    id: plain.id,
    source,
    requestType,
    requestTypeLabel,
    referenceNumber: plain.referenceNumber ?? null,
    status: plain.status,
    tab: classifyTab(plain.status),
    title: buildTitle(source, plain, plain.vehicle),
    vehicleId: plain.vehicleId ?? null,
    vehicle: vehicleLabel(plain.vehicle),
    memberId: plain.memberId,
    memberNumber: plain.member?.memberNumber ?? null,
    scheduledAt:
      plain.scheduledAt ||
      plain.scheduledDate ||
      plain.startDate ||
      null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    detail,
  };
}

async function resolveMemberId(memberId) {
  if (!memberId) return null;
  const member = await resolveMemberRef(memberId);
  return member.id;
}

async function fetchAllSources(memberId, { status, requestType, tab } = {}) {
  const mid = await resolveMemberId(memberId);
  const memberWhere = mid ? { memberId: mid } : {};
  const statusWhere = status ? { status } : {};

  const [transport, detailing, maintenance, sourcing, garage] = await Promise.all([
    TransportRequest.findAll({
      where: { ...memberWhere, ...statusWhere },
      include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
      order: [["createdAt", "DESC"]],
    }),
    Booking.findAll({
      where: { ...memberWhere, ...statusWhere, serviceType: SERVICE_TYPE },
      include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
      order: [["createdAt", "DESC"]],
    }),
    MaintenanceRequest.findAll({
      where: { ...memberWhere, ...statusWhere },
      include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
      order: [["createdAt", "DESC"]],
    }),
    SourcingRequest.findAll({
      where: { ...memberWhere, ...statusWhere },
      include: [MEMBER_INCLUDE],
      order: [["createdAt", "DESC"]],
    }),
    Request.findAll({
      where: { ...memberWhere, ...statusWhere },
      include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  const items = [
    ...transport.map((r) => wrapItem("transport", r)),
    ...detailing.map((r) => wrapItem("detailing", r)),
    ...maintenance.map((r) => wrapItem("maintenance", r)),
    ...sourcing.map((r) => wrapItem("sourcing", r)),
    ...garage.map((r) => wrapItem("garage_request", r)),
  ];

  let filtered = items;
  if (requestType) {
    filtered = filtered.filter((i) => i.requestType === requestType);
  }
  if (tab === "active") {
    filtered = filtered.filter((i) => i.tab === "active");
  } else if (tab === "past" || tab === "completed") {
    filtered = filtered.filter((i) => i.tab === "completed" || i.tab === "cancelled");
  } else if (tab === "cancelled") {
    filtered = filtered.filter((i) => i.tab === "cancelled");
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return filtered;
}

const REF_LOOKUP = [
  {
    source: "transport",
    model: TransportRequest,
    include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
  },
  {
    source: "detailing",
    model: Booking,
    extraWhere: { serviceType: SERVICE_TYPE },
    include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
  },
  {
    source: "maintenance",
    model: MaintenanceRequest,
    include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
  },
  {
    source: "sourcing",
    model: SourcingRequest,
    include: [MEMBER_INCLUDE],
  },
];

exports.findByReference = async (referenceNumber, memberId) => {
  const ref = String(referenceNumber || "").trim();
  if (!ref) throw new AppError("referenceNumber is required", 400);

  const mid = await resolveMemberId(memberId);

  for (const entry of REF_LOOKUP) {
    const where = { referenceNumber: ref, ...(entry.extraWhere || {}) };
    const row = await entry.model.findOne({ where, include: entry.include });
    if (!row) continue;
    if (mid && row.memberId !== mid) {
      throw new AppError("Request not found", 404);
    }
    return wrapItem(entry.source, row);
  }

  return null;
};

exports.getBySourceId = async (source, id, memberId) => {
  const entry = REF_LOOKUP.find((e) => e.source === source);
  if (!entry && source !== "garage_request") {
    throw new AppError(
      `Invalid source. Use one of: transport, detailing, maintenance, sourcing, garage_request`,
      400,
    );
  }

  const mid = await resolveMemberId(memberId);

  if (source === "garage_request") {
    const row = await Request.findByPk(id, {
      include: [VEHICLE_INCLUDE, MEMBER_INCLUDE],
    });
    if (!row) throw new AppError("Request not found", 404);
    if (mid && row.memberId !== mid) throw new AppError("Request not found", 404);
    return wrapItem("garage_request", row);
  }

  const row = await entry.model.findByPk(id, { include: entry.include });
  if (!row) throw new AppError("Request not found", 404);
  if (mid && row.memberId !== mid) throw new AppError("Request not found", 404);
  return wrapItem(source, row);
};

exports.listUnified = async (query) => {
  if (query.referenceNumber) {
    const item = await exports.findByReference(query.referenceNumber, query.memberId);
    return {
      unified: true,
      count: item ? 1 : 0,
      requests: item ? [item] : [],
    };
  }

  const items = await fetchAllSources(query.memberId, {
    status: query.status,
    requestType: query.requestType || query.type,
    tab: query.tab,
  });

  const limit = query.limit ?? 50;
  const sliced = items.slice(0, limit);

  return {
    unified: true,
    tab: query.tab || "all",
    count: sliced.length,
    total: items.length,
    requests: sliced,
  };
};
