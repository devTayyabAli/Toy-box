const AppError = require("../../utils/AppError");
const {
  TRANSPORT_SERVICE_TYPE_KEYS,
  TRANSPORT_SERVICE_TYPES,
  DEFAULT_STORAGE_LOCATION,
} = require("./transport.constants");

function parseTimeWindow(timeWindow) {
  if (!timeWindow || typeof timeWindow !== "string") {
    return {};
  }
  const match = timeWindow.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return {};
  }
  const pad = (t) => {
    const [h, m] = t.split(":");
    return `${String(h).padStart(2, "0")}:${m}`;
  };
  return { timeWindowStart: pad(match[1]), timeWindowEnd: pad(match[2]) };
}

function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function combineScheduledAt(dateOnly, timeStart) {
  if (!dateOnly || !timeStart) return null;
  const start = timeStart.length === 5 ? `${timeStart}:00` : timeStart;
  const iso = `${dateOnly}T${start}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new AppError("Invalid preferredDate or timeWindowStart", 400);
  }
  return d;
}

function formatTimeWindow(start, end) {
  if (!start || !end) return null;
  return `${start} – ${end}`;
}

function trimOrNull(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

/** Client may send serviceType (form flow) and requestType (garage label); prefer requestType when transport_delivery. */
function resolveServiceType(body) {
  const serviceType = trimOrNull(body.serviceType);
  const requestType = trimOrNull(body.requestType);

  if (requestType === "transport_delivery") return "transport_delivery";
  if (serviceType && TRANSPORT_SERVICE_TYPE_KEYS.includes(serviceType)) return serviceType;
  if (requestType && TRANSPORT_SERVICE_TYPE_KEYS.includes(requestType)) return requestType;
  return null;
}

function isDeliveryFromStorage(serviceType) {
  return serviceType === "pickup_from_storage" || serviceType === "transport_delivery";
}

function formatPreferredDateLabel(dateOnly) {
  if (!dateOnly) return null;
  const d = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Maps Figma form fields → persisted transport request fields.
 */
function normalizeTransportCreateBody(body) {
  const serviceType = resolveServiceType(body);
  const parsedWindow = parseTimeWindow(body.timeWindow);
  const timeWindowStart = body.timeWindowStart || parsedWindow.timeWindowStart;
  const timeWindowEnd = body.timeWindowEnd || parsedWindow.timeWindowEnd;
  const scheduledDate =
    toDateOnly(body.preferredDate) ||
    toDateOnly(body.scheduledDate) ||
    toDateOnly(body.scheduledAt);

  const deliveryAddress =
    trimOrNull(body.deliveryAddress) ||
    trimOrNull(body.destination) ||
    trimOrNull(body.address) ||
    null;
  const pickupAddress = trimOrNull(body.pickupAddress);
  const storageLocation = trimOrNull(body.storageLocation) || DEFAULT_STORAGE_LOCATION;

  let pickupLocation = trimOrNull(body.pickupLocation);
  let dropoffLocation =
    trimOrNull(body.dropoffLocation) || trimOrNull(body.dropoffAddress);

  if (isDeliveryFromStorage(serviceType)) {
    pickupLocation = storageLocation;
    dropoffLocation = deliveryAddress || dropoffLocation;
  } else if (serviceType === "return_to_storage") {
    pickupLocation = pickupAddress || deliveryAddress || pickupLocation;
    dropoffLocation = storageLocation;
  } else if (serviceType === "custom_transfer") {
    pickupLocation = pickupAddress || pickupLocation;
    dropoffLocation = trimOrNull(body.dropoffAddress) || dropoffLocation || deliveryAddress;
  }

  let scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if ((!scheduledAt || Number.isNaN(scheduledAt.getTime())) && scheduledDate && timeWindowStart) {
    scheduledAt = combineScheduledAt(scheduledDate, timeWindowStart);
  }

  const resolvedType =
    serviceType ||
    (pickupLocation && dropoffLocation ? "custom_transfer" : null);

  return {
    memberId: body.memberId,
    vehicleId: body.vehicleId,
    serviceType: resolvedType,
    pickupLocation,
    dropoffLocation,
    deliveryAddress: isDeliveryFromStorage(serviceType)
      ? dropoffLocation
      : serviceType === "return_to_storage"
        ? pickupLocation
        : deliveryAddress,
    scheduledAt,
    scheduledDate,
    timeWindowStart: timeWindowStart || null,
    timeWindowEnd: timeWindowEnd || null,
    notes: trimOrNull(body.notes),
    storageLocation,
  };
}

function assertNormalizedPayload(payload) {
  if (!payload.serviceType || !TRANSPORT_SERVICE_TYPE_KEYS.includes(payload.serviceType)) {
    throw new AppError(
      `serviceType is required (${TRANSPORT_SERVICE_TYPE_KEYS.join(", ")})`,
      400,
    );
  }
  if (!payload.pickupLocation?.trim()) {
    throw new AppError("pickupLocation or pickupAddress is required for this service type", 400);
  }
  if (!payload.dropoffLocation?.trim()) {
    throw new AppError(
      "dropoffLocation, dropoffAddress, or deliveryAddress is required for this service type",
      400,
    );
  }

  const legacyWithScheduledAt =
    payload.scheduledAt &&
    !Number.isNaN(new Date(payload.scheduledAt).getTime()) &&
    !payload.scheduledDate;

  if (legacyWithScheduledAt) {
    payload.scheduledDate = toDateOnly(payload.scheduledAt);
    const d = new Date(payload.scheduledAt);
    if (!payload.timeWindowStart) {
      payload.timeWindowStart = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    if (!payload.timeWindowEnd) {
      payload.timeWindowEnd = payload.timeWindowStart;
    }
    return;
  }

  if (!payload.scheduledDate) {
    throw new AppError("preferredDate (YYYY-MM-DD) is required", 400);
  }
  if (!payload.timeWindowStart || !payload.timeWindowEnd) {
    throw new AppError("timeWindowStart and timeWindowEnd are required (e.g. 10:00 and 12:00)", 400);
  }
  if (!payload.scheduledAt || Number.isNaN(payload.scheduledAt.getTime())) {
    throw new AppError("Could not build scheduledAt from preferredDate and timeWindowStart", 400);
  }
}

function buildReviewSummary(payload, vehicle) {
  const typeMeta = TRANSPORT_SERVICE_TYPES[payload.serviceType] || {};
  const destination = isDeliveryFromStorage(payload.serviceType)
      ? payload.dropoffLocation
      : payload.serviceType === "return_to_storage"
        ? payload.pickupLocation
        : `${payload.pickupLocation} → ${payload.dropoffLocation}`;

  return {
    memberId: payload.memberId,
    memberNumber: payload.memberNumber ?? null,
    vehicleId: payload.vehicleId,
    vehicle: vehicle
      ? [vehicle.make, vehicle.model].filter(Boolean).join(" ")
      : null,
    serviceType: payload.serviceType,
    serviceTypeLabel: typeMeta.label || payload.serviceType,
    serviceTypeDescription: typeMeta.description || null,
    pickupLocation: payload.pickupLocation,
    dropoffLocation: payload.dropoffLocation,
    deliveryAddress: payload.deliveryAddress,
    destination,
    preferredDate: payload.scheduledDate,
    preferredDateLabel: formatPreferredDateLabel(payload.scheduledDate),
    timeWindow: formatTimeWindow(payload.timeWindowStart, payload.timeWindowEnd),
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    scheduledAt: payload.scheduledAt,
    notes: payload.notes,
  };
}

module.exports = {
  normalizeTransportCreateBody,
  assertNormalizedPayload,
  buildReviewSummary,
  resolveServiceType,
  isDeliveryFromStorage,
  trimOrNull,
  formatPreferredDateLabel,
  formatTimeWindow,
  parseTimeWindow,
};
