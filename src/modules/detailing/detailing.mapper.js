const AppError = require("../../utils/AppError");
const { getPackage, calculateTotal } = require("./detailing.data");
const { SERVICE_LOCATIONS, PACKAGE_KEY_ALIASES } = require("./detailing.constants");

function parseTimeWindow(timeWindow) {
  if (!timeWindow || typeof timeWindow !== "string") return {};
  const match = timeWindow.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i);
  if (!match) return {};
  const pad = (t) => {
    const [h, m] = t.split(":");
    return `${String(h).padStart(2, "0")}:${m}`;
  };
  return { timeWindowStart: pad(match[1]), timeWindowEnd: pad(match[2]) };
}

function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function normalizePackageKey(key) {
  if (!key) return null;
  const lower = String(key).toLowerCase();
  return PACKAGE_KEY_ALIASES[lower] || lower;
}

function resolveServiceLocation(body) {
  const key = body.locationKey || body.serviceLocationKey;
  if (key) {
    const found = SERVICE_LOCATIONS.find((l) => l.key === key);
    if (found) return { key: found.key, label: found.label, address: found.address };
  }
  const address =
    body.serviceLocation ||
    body.location ||
    body.locationAddress ||
    null;
  if (address?.trim()) {
    return { key: "custom", label: address.trim(), address: address.trim() };
  }
  return SERVICE_LOCATIONS[0];
}

function scheduledToDates(scheduledDate, timeWindowStart, timeWindowEnd) {
  const day = toDateOnly(scheduledDate);
  if (!day) {
    throw new AppError("preferredDate / scheduledDate is required", 400);
  }
  const startParts = (timeWindowStart || "09:00").split(":");
  const endParts = (timeWindowEnd || "14:00").split(":");
  const start = new Date(
    `${day}T${String(startParts[0]).padStart(2, "0")}:${startParts[1] || "00"}:00`,
  );
  const end = new Date(
    `${day}T${String(endParts[0]).padStart(2, "0")}:${endParts[1] || "00"}:00`,
  );
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("Invalid time window", 400);
  }
  return { startDate: start, endDate: end, scheduledDate: day };
}

function formatPreferredDateLabel(dateOnly) {
  if (!dateOnly) return null;
  const d = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeWindowDisplay(start, end) {
  if (!start || !end) return null;
  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

function normalizeDetailingBookingBody(body) {
  const parsed = parseTimeWindow(body.timeWindow);
  const packageKey = normalizePackageKey(body.packageKey);
  const scheduledDate =
    toDateOnly(body.preferredDate) ||
    toDateOnly(body.scheduledDate);
  const timeWindowStart = body.timeWindowStart || parsed.timeWindowStart;
  const timeWindowEnd = body.timeWindowEnd || parsed.timeWindowEnd;
  const location = resolveServiceLocation(body);

  return {
    memberId: body.memberId,
    vehicleId: body.vehicleId,
    packageKey,
    addonKeys: body.addonKeys || [],
    scheduledDate,
    timeWindowStart: timeWindowStart || null,
    timeWindowEnd: timeWindowEnd || null,
    specialInstructions: body.specialInstructions ?? body.notes ?? null,
    serviceLocationKey: location.key,
    serviceLocation: location.label,
    serviceLocationAddress: location.address,
  };
}

function assertDetailingPayload(payload) {
  if (!payload.packageKey || !getPackage(payload.packageKey)) {
    throw new AppError(
      "packageKey is required (full_detail, interior_only, exterior_wash)",
      400,
    );
  }
  if (!payload.scheduledDate) {
    throw new AppError("preferredDate / scheduledDate is required (YYYY-MM-DD)", 400);
  }
  if (!payload.timeWindowStart || !payload.timeWindowEnd) {
    throw new AppError("timeWindowStart and timeWindowEnd are required (e.g. 10:00 and 14:00)", 400);
  }
  if (!payload.serviceLocation) {
    throw new AppError("locationKey or serviceLocation is required", 400);
  }
  const pricing = calculateTotal(payload.packageKey, payload.addonKeys);
  if (!pricing) {
    throw new AppError("Invalid package or add-ons", 400);
  }
  return pricing;
}

function buildReviewSummary(payload, vehicle, pricing) {
  return {
    service: "Detailing & Wash",
    vehicleId: payload.vehicleId,
    vehicle: vehicle
      ? [vehicle.make, vehicle.model].filter(Boolean).join(" ")
      : null,
    package: {
      key: pricing.package.key,
      name: pricing.package.name,
      priceAed: pricing.package.priceAed,
      inclusions: pricing.package.inclusions,
    },
    addons: pricing.addons.map((a) => ({
      key: a.key,
      name: a.name,
      priceAed: a.priceAed,
    })),
    location: payload.serviceLocation,
    locationKey: payload.serviceLocationKey,
    serviceLocation: payload.serviceLocation,
    preferredDate: payload.scheduledDate,
    preferredDateLabel: formatPreferredDateLabel(payload.scheduledDate),
    timeWindow: formatTimeWindowDisplay(payload.timeWindowStart, payload.timeWindowEnd),
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    specialInstructions: payload.specialInstructions,
    notes: payload.specialInstructions,
    totalEstimate: pricing.subtotalAed,
    currency: pricing.currency,
    totalLabel: `${pricing.currency} ${pricing.subtotalAed.toLocaleString()}`,
  };
}

module.exports = {
  normalizeDetailingBookingBody,
  assertDetailingPayload,
  buildReviewSummary,
  scheduledToDates,
  formatPreferredDateLabel,
  formatTimeWindowDisplay,
  normalizePackageKey,
};
