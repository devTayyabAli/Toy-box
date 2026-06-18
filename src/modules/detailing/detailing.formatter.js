const { getPackage, getAddons } = require("./detailing.data");
const { formatTimeline } = require("./detailing.timeline");
const { DEFAULT_CONCIERGE } = require("./detailing.constants");
const {
  formatPreferredDateLabel,
  formatTimeWindowDisplay,
} = require("./detailing.mapper");

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function formatSelectionSummary(booking) {
  const b = booking.get ? booking.get({ plain: true }) : booking;
  const pkg = getPackage(b.packageKey);
  const addons = getAddons((b.addons || []).map((a) => (typeof a === "string" ? a : a.key)));

  return {
    service: "Detailing & Wash",
    vehicle: vehicleLabel(b.vehicle),
    vehicleId: b.vehicleId,
    package: pkg
      ? {
          key: pkg.key,
          name: pkg.name,
          inclusions: pkg.inclusions,
          priceAed: pkg.priceAed,
        }
      : { key: b.packageKey },
    addons: addons.map((a) => ({ key: a.key, name: a.name, priceAed: a.priceAed })),
    location: b.serviceLocation || b.bayLocation,
    serviceLocation: b.serviceLocation,
    locationKey: b.serviceLocationKey,
    scheduledDate: b.scheduledDate,
    preferredDate: b.scheduledDate,
    preferredDateLabel: formatPreferredDateLabel(b.scheduledDate),
    timeWindow: formatTimeWindowDisplay(b.timeWindowStart, b.timeWindowEnd),
    timeWindowStart: b.timeWindowStart,
    timeWindowEnd: b.timeWindowEnd,
    specialInstructions: b.specialInstructions,
    notes: b.specialInstructions,
    totalEstimate: b.totalEstimate,
    currency: b.currency || "AED",
    totalLabel: `${b.currency || "AED"} ${Number(b.totalEstimate || 0).toLocaleString()}`,
  };
}

function toBookingSummary(booking) {
  const b = booking.get ? booking.get({ plain: true }) : booking;
  return {
    id: b.id,
    referenceNumber: b.referenceNumber,
    status: b.status,
    serviceType: b.serviceType,
    ...formatSelectionSummary(booking),
    createdAt: b.createdAt,
  };
}

function toBookingConfirmation(booking) {
  const summary = toBookingSummary(booking);
  return {
    ...summary,
    message: "Your detailing request has been received.",
    statusLabel: summary.status,
  };
}

function toBookingProgress(booking) {
  const b = booking.get ? booking.get({ plain: true }) : booking;
  const staff = b.assignedStaff || DEFAULT_CONCIERGE;
  const activeStep = (b.timeline || []).find((s) => s.status === "active");

  return {
    id: b.id,
    referenceNumber: b.referenceNumber,
    status: b.status,
    service: "Detailing & Wash",
    vehicle: vehicleLabel(b.vehicle),
    packageName: getPackage(b.packageKey)?.name || b.packageKey,
    location: b.serviceLocation || b.bayLocation,
    scheduledDate: b.scheduledDate,
    preferredDateLabel: formatPreferredDateLabel(b.scheduledDate),
    timeWindow: formatTimeWindowDisplay(b.timeWindowStart, b.timeWindowEnd),
    totalEstimate: b.totalEstimate,
    currency: b.currency || "AED",
    timeline: formatTimeline(b.timeline || []),
    concierge: staff,
    detailer: {
      name: staff.technicianName || staff.name,
      role: staff.role || "Detailer",
      avatarUrl: staff.avatarUrl,
    },
    estimatedMinutesRemaining: b.estimatedMinutesRemaining,
    estimatedCompletionTime:
      activeStep?.meta?.estimatedCompletionTime || b.timeWindowEnd,
    bayLocation: b.bayLocation,
    canCancel: !["Completed", "Cancelled"].includes(b.status),
  };
}

function toJobDetail(booking) {
  const b = booking.get ? booking.get({ plain: true }) : booking;
  const pkg = getPackage(b.packageKey);
  const duration =
    b.durationMinutes != null
      ? `${Math.floor(b.durationMinutes / 60)}h ${b.durationMinutes % 60}min`
      : null;
  const staff = b.assignedStaff || {};

  return {
    id: b.id,
    referenceNumber: b.referenceNumber,
    status: b.status,
    service: "Detailing & Wash",
    vehicle: vehicleLabel(b.vehicle),
    packageName: pkg?.name || b.packageKey,
    location: b.serviceLocation || b.bayLocation,
    scheduledDate: b.scheduledDate,
    timeWindow: formatTimeWindowDisplay(b.timeWindowStart, b.timeWindowEnd),
    completionPhotoUrl: b.completionPhotoUrl,
    duration,
    durationMinutes: b.durationMinutes,
    completedBy: staff.technicianName || staff.name || "Detail team",
    detailer: staff.technicianName || staff.name,
    bayUsed: b.bayLocation,
    totalPaid: b.totalEstimate,
    currency: b.currency || "AED",
    totalLabel: `${b.currency || "AED"} ${Number(b.totalEstimate || 0).toLocaleString()}`,
    completedAt: b.completedAt,
    workCompleted: b.workCompleted || [],
    whatCompleted: b.workCompleted || [],
  };
}

module.exports = {
  vehicleLabel,
  formatSelectionSummary,
  toBookingSummary,
  toBookingConfirmation,
  toBookingProgress,
  toJobDetail,
};
