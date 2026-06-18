function toSummary(req) {
  const r = req.get ? req.get({ plain: true }) : req;
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    memberId: r.memberId,
    make: r.make,
    model: r.model,
    yearMin: r.yearMin,
    yearMax: r.yearMax,
    colour: r.colour,
    trim: r.trim,
    specifications: r.specifications || {},
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    currency: r.currency || "AED",
    timelineNotes: r.timelineNotes,
    notes: r.notes,
    matches: r.matches || [],
    canCancel: !["Completed", "Cancelled"].includes(r.status),
    createdAt: r.createdAt,
  };
}

function toStatus(req) {
  const r = req.get ? req.get({ plain: true }) : req;
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    status: r.status,
    timeline: r.timeline || [],
    matches: r.matches || [],
    canCancel: !["Completed", "Cancelled"].includes(r.status),
  };
}

function toReview(body) {
  return {
    make: body.make,
    model: body.model,
    yearRange:
      body.yearMin || body.yearMax
        ? { min: body.yearMin, max: body.yearMax }
        : null,
    colour: body.colour,
    trim: body.trim,
    specifications: body.specifications || {},
    budget: {
      min: body.budgetMin,
      max: body.budgetMax,
      currency: body.currency || "AED",
    },
    timelineNotes: body.timelineNotes,
    notes: body.notes,
  };
}

function toAdminSummary(req) {
  const summary = toSummary(req);
  const r = req.get ? req.get({ plain: true }) : req;
  const m = r.member;
  return {
    ...summary,
    member: m
      ? {
          id: m.id,
          name:
            m.name ||
            [m.firstName, m.lastName].filter(Boolean).join(" ") ||
            null,
          email: m.email || null,
        }
      : null,
  };
}

function toStaffSummary(summary, pendingAssignment) {
  const pending = pendingAssignment
    ? {
        id: pendingAssignment.id,
        vehicleId: pendingAssignment.vehicleId,
        memberId: summary.member?.id || summary.memberId || null,
        status: pendingAssignment.status,
        offerStartDate: pendingAssignment.offerStartDate || null,
        offerEndDate: pendingAssignment.offerEndDate || null,
        preferredDates:
          pendingAssignment.offerStartDate || pendingAssignment.offerEndDate
            ? {
                start: pendingAssignment.offerStartDate || null,
                end: pendingAssignment.offerEndDate || null,
              }
            : null,
        vehicle: pendingAssignment.vehicle
          ? {
              id: pendingAssignment.vehicle.id,
              make: pendingAssignment.vehicle.make,
              model: pendingAssignment.vehicle.model,
              year: pendingAssignment.vehicle.year,
            }
          : null,
        member: summary.member || null,
      }
    : null;

  let confirmationStatus = "pending";
  if (summary.status === "Completed") confirmationStatus = "completed";
  else if (summary.status === "Cancelled") confirmationStatus = "cancelled";
  else if (summary.status === "Offer ready" || pending) confirmationStatus = "in_review";
  else if (summary.status === "Inspection in progress") confirmationStatus = "in_review";

  const canOfferVehicle =
    !pending &&
    ["Request received", "Searching for vehicle", "Vehicle found", "Inspection in progress"].includes(
      summary.status,
    );

  return {
    ...summary,
    confirmationStatus,
    canOfferVehicle,
    pendingOffer: pending,
  };
}

module.exports = { toSummary, toStatus, toReview, toAdminSummary, toStaffSummary };
