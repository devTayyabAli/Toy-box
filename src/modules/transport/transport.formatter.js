const { TRANSPORT_SERVICE_TYPES } = require("./transport.constants");
const { formatPreferredDateLabel, formatTimeWindow } = require("./transport.mapper");

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function toSummary(row) {
  const r = row.get ? row.get({ plain: true }) : row;
  const typeMeta = TRANSPORT_SERVICE_TYPES[r.serviceType] || {};
  const timeWindow = formatTimeWindow(r.timeWindowStart, r.timeWindowEnd);

  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    vehicle: vehicleLabel(r.vehicle),
    vehicleId: r.vehicleId,
    memberId: r.memberId,
    memberNumber: r.member?.memberNumber ?? null,
    serviceType: r.serviceType,
    serviceTypeLabel: typeMeta.label || r.serviceType,
    serviceTypeDescription: typeMeta.description || null,
    pickupLocation: r.pickupLocation,
    dropoffLocation: r.dropoffLocation,
    deliveryAddress: r.deliveryAddress,
    destination:
      r.serviceType === "pickup_from_storage" || r.serviceType === "transport_delivery"
        ? r.dropoffLocation
        : r.serviceType === "return_to_storage"
          ? r.pickupLocation
          : r.dropoffLocation,
    preferredDate: r.scheduledDate,
    preferredDateLabel: formatPreferredDateLabel(r.scheduledDate),
    timeWindow,
    timeWindowStart: r.timeWindowStart,
    timeWindowEnd: r.timeWindowEnd,
    scheduledAt: r.scheduledAt,
    notes: r.notes,
    timeline: r.timeline || [],
    canCancel: !["Completed", "Cancelled"].includes(r.status),
    createdAt: r.createdAt,
  };
}

module.exports = { toSummary, vehicleLabel };
