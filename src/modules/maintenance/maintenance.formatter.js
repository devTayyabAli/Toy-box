const { getServices, LOCATIONS } = require("./maintenance.data");

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function locationLabel(key) {
  return LOCATIONS.find((l) => l.key === key)?.name || key;
}

function toSummary(req) {
  const r = req.get ? req.get({ plain: true }) : req;
  const services = getServices(r.serviceKeys || []);
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    vehicle: vehicleLabel(r.vehicle),
    vehicleId: r.vehicleId,
    memberId: r.memberId,
    services: services.map((s) => ({ key: s.key, name: s.name })),
    scheduledAt: r.scheduledAt,
    location: locationLabel(r.locationKey),
    locationKey: r.locationKey,
    notes: r.notes,
    documentUrls: r.documentUrls || [],
    totalAmount: r.totalAmount,
    currency: r.currency || "AED",
    lineItems: r.lineItems || [],
    canCancel: !["Completed", "Cancelled"].includes(r.status),
    requiresApproval: r.status === "Awaiting approval",
    isPaid: Boolean(r.paidAt),
    createdAt: r.createdAt,
  };
}

function toStatus(req) {
  const r = req.get ? req.get({ plain: true }) : req;
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    vehicle: vehicleLabel(r.vehicle),
    timeline: r.timeline || [],
    canCancel: !["Completed", "Cancelled"].includes(r.status),
  };
}

function toApproval(req) {
  const summary = toSummary(req);
  return {
    ...summary,
    lineItems: summary.lineItems,
    totalAmount: summary.totalAmount,
    message: "Review itemized services and approve payment to continue.",
  };
}

function toJobDetail(req) {
  const r = req.get ? req.get({ plain: true }) : req;
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    vehicle: vehicleLabel(r.vehicle),
    vehicleImageUrl: r.vehicle?.imageUrl || null,
    checklist: r.workCompleted || [],
    assignedStaff: r.assignedStaff,
    location: locationLabel(r.locationKey),
    canStart: r.status === "Service in progress",
    canComplete: r.status === "Service in progress" || r.status === "Ready for delivery",
  };
}

module.exports = { toSummary, toStatus, toApproval, toJobDetail, vehicleLabel };
