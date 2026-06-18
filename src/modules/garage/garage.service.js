const AppError = require("../../utils/AppError");
const { uploadVehicleDocument } = require("../../services/storage.service");
const { Vehicle } = require("../../models");
const garageRepository = require("./garage.repository");
const { loadGarageRequests, loadRecentActions } = require("./garage.activity");
const {
  toGarageListItem,
  toGarageOverviewCard,
  toGarageFeaturedVehicle,
  toVehicleDetails,
  toHealthReport,
  toSpecs,
  toDocuments,
  toGarageRequest,
  buildGarageSummaryLabel,
  displayName,
} = require("./garage.formatter");
const {
  REQUEST_TYPES,
  REQUEST_TYPE_LABELS,
  QUICK_ACTIONS,
  SERVICE_REQUEST_OPTIONS,
  VEHICLE_TYPE_TABS,
  GARAGE_STATUS_TABS,
  PAST_REQUEST_STATUSES,
} = require("./garage.constants");

function resolveMemberId(queryMemberId, authUserId) {
  return queryMemberId ?? authUserId ?? null;
}

function resolveRequestType(body) {
  if (body.type && REQUEST_TYPES.includes(body.type)) {
    return body.type;
  }
  if (body.serviceCategory) {
    const opt = SERVICE_REQUEST_OPTIONS.find((o) => o.key === body.serviceCategory);
    if (opt) return opt.type;
  }
  return body.type;
}

exports.getOverview = async (query, authUserId) => {
  const memberId = resolveMemberId(query.memberId, authUserId);
  if (!memberId) {
    throw new AppError("memberId is required for garage overview", 400);
  }

  const filter = query.filter || "mine";
  const search = query.search || null;

  const member = await garageRepository.findMemberById(memberId);
  const location = member?.residence?.trim() || "";

  const vehicles = await garageRepository.findVehicles({
    filter,
    memberId,
    search,
  });

  let featuredIndex = 0;
  if (query.selectedVehicleId) {
    const idx = vehicles.findIndex((v) => v.id === Number(query.selectedVehicleId));
    if (idx >= 0) {
      featuredIndex = idx;
    }
  }

  const cards = vehicles.map((v, index) =>
    toGarageOverviewCard(v, { isSelected: index === featuredIndex }),
  );

  const vehicleCount = vehicles.length;

  return {
    title: "MY GARAGE",
    summaryLabel: buildGarageSummaryLabel(vehicleCount, location),
    vehicleCount,
    location,
    featuredVehicle: vehicles.length
      ? toGarageFeaturedVehicle(vehicles[featuredIndex])
      : null,
    vehicles: cards,
  };
};

exports.listVehicles = async (query, authUserId) => {
  const memberId = resolveMemberId(query.memberId, authUserId);
  if (query.filter === "mine" && !memberId) {
    throw new AppError("memberId is required when filter is mine", 400);
  }

  const counts = await garageRepository.countVehiclesByType({
    filter: query.filter,
    memberId,
    search: query.search,
  });

  const statusCounts = await garageRepository.countGarageStatuses({
    filter: query.filter,
    memberId,
    search: query.search,
  });

  const vehicles = await garageRepository.findVehicles({
    filter: query.filter,
    memberId,
    search: query.search,
    vehicleType: query.vehicleType,
    garageStatus: query.garageStatus,
  });

  const vehicleTypeTabs = VEHICLE_TYPE_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
    vehicleType: tab.value,
    count: counts[tab.value] || 0,
  }));

  const statusTabs = GARAGE_STATUS_TABS.map((t) => ({
    key: t.key,
    label: t.label,
    count: statusCounts[t.key] ?? 0,
  }));

  return {
    filter: query.filter,
    vehicleType: query.vehicleType || null,
    garageStatus: query.garageStatus || "all",
    search: query.search || null,
    count: vehicles.length,
    vehicleTypeTabs,
    statusTabs,
    tabs: statusTabs,
    vehicles: vehicles.map(toGarageListItem),
    _api: {
      list: "GET /api/v1/vehicles",
      detail: "GET /api/v1/vehicles/:id?include=all",
      wizard: "GET /api/v1/vehicles/:id?view=wizard",
    },
  };
};

function parseInclude(include) {
  if (!include || include === "all") {
    return new Set(["details", "health", "documents", "specs", "actions", "requests"]);
  }
  return new Set(
    String(include)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

exports.getVehicleBundle = async (id, query = {}) => {
  const vehicle = await garageRepository.findVehicleById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const include = parseInclude(query.include);
  const bundle = {
    id: Number(id),
    displayName: displayName(vehicle),
  };

  if (include.has("details") || include.has("all")) {
    const details = toVehicleDetails(vehicle);
    if (include.has("actions")) {
      details.recentActions = await loadRecentActions(id, 8);
    }
    bundle.details = details;
  }

  if (include.has("health")) {
    bundle.healthReport = toHealthReport(vehicle);
  }
  if (include.has("documents")) {
    bundle.documents = toDocuments(vehicle);
  }
  if (include.has("specs")) {
    bundle.specs = toSpecs(vehicle);
  }
  if (include.has("actions") && !bundle.details) {
    bundle.recentActions = await loadRecentActions(id, query.actionsLimit || 20);
  }
  if (include.has("requests")) {
    const items = await loadGarageRequests({
      vehicleId: id,
      memberId: vehicle.memberId,
      limit: query.requestsLimit || 20,
    });
    const active = items.filter((r) => !PAST_REQUEST_STATUSES.includes(r.status));
    const past = items.filter((r) => PAST_REQUEST_STATUSES.includes(r.status));
    bundle.requests = { active, past, all: items };
  }

  bundle._meta = {
    include: [...include],
    hint: "One call replaces separate /health-report, /documents, /specs, /actions, /requests",
  };

  return bundle;
};

exports.getVehicleDetails = async (id, query = {}) => {
  const include = query.include ?? (query.view === "wizard" ? "details" : "all");
  if (include && include !== "details") {
    return exports.getVehicleBundle(id, { ...query, include });
  }
  const vehicle = await garageRepository.findVehicleById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  const details = toVehicleDetails(vehicle);
  details.recentActions = await loadRecentActions(id, 8);
  return details;
};

exports.getVehicleActions = async (vehicleId, limit) => {
  const vehicle = await garageRepository.findVehicleById(vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  const actions = await loadRecentActions(vehicleId, limit || 20);
  return {
    vehicleId: Number(vehicleId),
    displayName: displayName(vehicle),
    actions,
  };
};

exports.getHealthReport = async (id) => {
  const vehicle = await garageRepository.findVehicleById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return toHealthReport(vehicle);
};

exports.updateHealth = async (id, health) => {
  const vehicle = await garageRepository.updateVehicle(id, { health });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return toHealthReport(vehicle);
};

exports.getSpecs = async (id) => {
  const vehicle = await garageRepository.findVehicleById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return toSpecs(vehicle);
};

exports.getDocuments = async (id) => {
  const vehicle = await garageRepository.findVehicleById(id);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return toDocuments(vehicle);
};

exports.uploadDocument = async (vehicleId, documentKey, file) => {
  if (!file?.buffer?.length) {
    throw new AppError("Document file is required", 400);
  }
  if (!Vehicle.DOCUMENT_TYPES.includes(documentKey)) {
    throw new AppError(`Invalid document key. Allowed: ${Vehicle.DOCUMENT_TYPES.join(", ")}`, 400);
  }

  const vehicle = await garageRepository.findVehicleById(vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const { url } = await uploadVehicleDocument({
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalName: file.originalname,
  });

  const documents = { ...(vehicle.documents || {}), [documentKey]: url };
  await garageRepository.updateVehicle(vehicleId, { documents });
  return toDocuments(await garageRepository.findVehicleById(vehicleId));
};

exports.togglePriority = async (id, isPriority) => {
  const vehicle = await garageRepository.updateVehicle(id, { isPriority });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return toGarageListItem(vehicle);
};

exports.listRequests = async (query) => {
  if (query.tab === "active" || query.tab === "past" || query.unified === "true") {
    const items = await loadGarageRequests({
      memberId: query.memberId,
      vehicleId: query.vehicleId,
      tab: query.tab,
      type: query.type,
      limit: query.limit || 50,
    });
    const active = items.filter((r) => !PAST_REQUEST_STATUSES.includes(r.status));
    const past = items.filter((r) => PAST_REQUEST_STATUSES.includes(r.status));
    return {
      tab: query.tab || "all",
      count: items.length,
      activeCount: active.length,
      pastCount: past.length,
      requests: query.tab === "past" ? past : query.tab === "active" ? active : items,
      activeRequests: active,
      pastRequests: past,
    };
  }

  const requests = await garageRepository.findRequests(query);
  const mapped = requests.map(toGarageRequest);
  const active = mapped.filter((r) => !PAST_REQUEST_STATUSES.includes(r.status));
  const past = mapped.filter((r) => PAST_REQUEST_STATUSES.includes(r.status));

  return {
    count: mapped.length,
    activeCount: active.length,
    pastCount: past.length,
    requests: mapped,
    activeRequests: active,
    pastRequests: past,
  };
};

exports.getRequest = async (id) => {
  const request = await garageRepository.findRequestById(id);
  if (!request) {
    throw new AppError("Request not found", 404);
  }
  return toGarageRequest(request);
};

exports.getRequestCategories = async (memberId) => {
  const counts = await garageRepository.countRequestsByType(memberId);
  const countByType = Object.fromEntries(
    counts.filter((r) => r.type).map((r) => [r.type, Number(r.count)]),
  );

  const categories = REQUEST_TYPES.map((type) => ({
    type,
    label: REQUEST_TYPE_LABELS[type],
    count: countByType[type] || 0,
  }));

  return { categories, quickActions: QUICK_ACTIONS };
};

exports.getServiceOptions = () => ({
  options: SERVICE_REQUEST_OPTIONS,
});

exports.createRequest = async (body) => {
  const vehicle = await garageRepository.findVehicleById(body.vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const type = resolveRequestType(body);
  if (!REQUEST_TYPES.includes(type)) {
    throw new AppError("Invalid request type", 400);
  }

  const title =
    body.title ||
    `${REQUEST_TYPE_LABELS[type]} - ${displayName(vehicle)}`;

  const request = await garageRepository.createRequest({
    memberId: body.memberId,
    vehicleId: body.vehicleId,
    type,
    title,
    notes: body.notes,
    scheduledAt: body.scheduledAt,
    status: body.status || "Requested",
  });

  const full = await garageRepository.findRequestById(request.id);
  return toGarageRequest(full);
};

exports.getVehicleRequests = async (vehicleId, query) => {
  const vehicle = await garageRepository.findVehicleById(vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  if (query.tab || query.unified === "true") {
    const items = await loadGarageRequests({
      vehicleId,
      memberId: vehicle.memberId,
      tab: query.tab,
      limit: query.limit || 20,
    });
    return {
      vehicleId,
      displayName: displayName(vehicle),
      requests: items,
    };
  }

  const requests = await garageRepository.findRequests({
    vehicleId,
    limit: query.limit || 10,
  });
  return {
    vehicleId,
    displayName: displayName(vehicle),
    requests: requests.map(toGarageRequest),
  };
};
