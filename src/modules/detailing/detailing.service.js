const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const { Vehicle } = require("../../models");
const { calculateTotal } = require("./detailing.data");
const { SERVICE_TYPE, DEFAULT_CONCIERGE, INITIAL_STATUS } = require("./detailing.constants");
const { buildInitialTimeline, buildWorkCompleted, nowIso } = require("./detailing.timeline");
const detailingRepository = require("./detailing.repository");
const {
  toBookingConfirmation,
  toBookingSummary,
  toBookingProgress,
  toJobDetail,
} = require("./detailing.formatter");
const { PACKAGES, ADDONS } = require("./detailing.data");
const {
  normalizeDetailingBookingBody,
  assertDetailingPayload,
  buildReviewSummary,
  scheduledToDates,
} = require("./detailing.mapper");

async function uniqueReference() {
  const year = new Date().getFullYear();
  const mmdd = `${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}`;
  for (let i = 0; i < 8; i += 1) {
    const seq = String(crypto.randomInt(100, 999));
    const referenceNumber = `TB - ${year} - ${mmdd} - ${seq}`;
    if (!(await detailingRepository.referenceExists(referenceNumber))) {
      return referenceNumber;
    }
  }
  throw new AppError("Could not generate booking reference", 500);
}

function normalizeAddonKeys(addonKeys = []) {
  return [...new Set(addonKeys)];
}

function preparePayload(body) {
  const payload = normalizeDetailingBookingBody(body);
  const pricing = assertDetailingPayload(payload);
  return { payload, pricing };
}

exports.getCatalog = () => ({
  packages: PACKAGES,
  addons: ADDONS,
  serviceLocations: require("./detailing.constants").SERVICE_LOCATIONS,
});

exports.getPackages = () => ({ packages: PACKAGES });
exports.getAddons = () => ({ addons: ADDONS });
exports.getLocations = () => ({
  locations: require("./detailing.constants").SERVICE_LOCATIONS,
});

exports.estimate = (body) => {
  const { payload, pricing } = preparePayload(body);
  return {
    ...pricing,
    vehicleId: payload.vehicleId,
    scheduledDate: payload.scheduledDate,
    preferredDate: payload.scheduledDate,
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    serviceLocation: payload.serviceLocation,
    locationKey: payload.serviceLocationKey,
    specialInstructions: payload.specialInstructions,
    totalEstimate: pricing.subtotalAed,
  };
};

exports.createBooking = async (body) => {
  const { payload, pricing } = preparePayload(body);
  const vehicle = await Vehicle.findByPk(payload.vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const addonKeys = normalizeAddonKeys(payload.addonKeys);
  const { startDate, endDate, scheduledDate } = scheduledToDates(
    payload.scheduledDate,
    payload.timeWindowStart,
    payload.timeWindowEnd,
  );
  const referenceNumber = await uniqueReference();
  const timeline = buildInitialTimeline(addonKeys);

  const booking = await detailingRepository.createBooking({
    memberId: payload.memberId,
    vehicleId: payload.vehicleId,
    serviceType: SERVICE_TYPE,
    referenceNumber,
    packageKey: payload.packageKey,
    addons: addonKeys,
    specialInstructions: payload.specialInstructions,
    scheduledDate,
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    serviceLocationKey: payload.serviceLocationKey,
    serviceLocation: payload.serviceLocation,
    startDate,
    endDate,
    status: INITIAL_STATUS,
    totalEstimate: pricing.subtotalAed,
    currency: "AED",
    timeline,
    assignedStaff: DEFAULT_CONCIERGE,
    bayLocation: payload.serviceLocation,
  });

  const full = await detailingRepository.findBookingById(booking.id);
  return toBookingConfirmation(full);
};

exports.listBookings = async (query) => {
  const rows = await detailingRepository.findBookings(query);
  return {
    count: rows.length,
    bookings: rows.map((b) => toBookingSummary(b)),
  };
};

exports.getBooking = async (id) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }
  return toBookingSummary(booking);
};

exports.getProgress = async (id) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }
  return toBookingProgress(booking);
};

exports.getJobDetail = async (id) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }
  if (booking.status !== "Completed") {
    throw new AppError("Job detail is available when booking is completed", 400);
  }
  return toJobDetail(booking);
};

exports.updateBooking = async (id, body) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }
  if (!["Request Received", "Awaiting confirmation", "Confirmed"].includes(booking.status)) {
    throw new AppError("Booking can only be edited before work starts", 400);
  }

  const merged = {
    memberId: booking.memberId,
    vehicleId: booking.vehicleId,
    packageKey: body.packageKey ?? booking.packageKey,
    addonKeys: body.addonKeys ?? booking.addons ?? [],
    preferredDate: body.preferredDate ?? body.scheduledDate ?? booking.scheduledDate,
    scheduledDate: body.scheduledDate ?? booking.scheduledDate,
    timeWindowStart: body.timeWindowStart ?? booking.timeWindowStart,
    timeWindowEnd: body.timeWindowEnd ?? booking.timeWindowEnd,
    timeWindow: body.timeWindow,
    locationKey: body.locationKey ?? body.serviceLocationKey ?? booking.serviceLocationKey,
    serviceLocation: body.serviceLocation ?? body.location ?? booking.serviceLocation,
    specialInstructions: body.specialInstructions ?? body.notes ?? booking.specialInstructions,
  };

  const { payload, pricing } = preparePayload(merged);
  const addonKeys = normalizeAddonKeys(payload.addonKeys);

  const patch = {
    packageKey: payload.packageKey,
    addons: addonKeys,
    totalEstimate: pricing.subtotalAed,
    timeline: buildInitialTimeline(addonKeys),
    timeWindowStart: payload.timeWindowStart,
    timeWindowEnd: payload.timeWindowEnd,
    serviceLocationKey: payload.serviceLocationKey,
    serviceLocation: payload.serviceLocation,
    bayLocation: payload.serviceLocation,
  };

  if (body.scheduledDate || body.preferredDate || body.timeWindowStart) {
    const dates = scheduledToDates(
      payload.scheduledDate,
      payload.timeWindowStart,
      payload.timeWindowEnd,
    );
    patch.scheduledDate = dates.scheduledDate;
    patch.startDate = dates.startDate;
    patch.endDate = dates.endDate;
  }
  if (body.specialInstructions !== undefined || body.notes !== undefined) {
    patch.specialInstructions = payload.specialInstructions;
  }

  const updated = await detailingRepository.updateBooking(id, patch);
  return toBookingSummary(updated);
};

exports.cancelBooking = async (id) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }
  if (["Completed", "Cancelled"].includes(booking.status)) {
    throw new AppError("Booking cannot be cancelled", 400);
  }

  const timeline = (booking.timeline || []).map((step) =>
    step.status === "pending" || step.status === "active"
      ? { ...step, status: "skipped" }
      : step,
  );

  const updated = await detailingRepository.updateBooking(id, {
    status: "Cancelled",
    timeline,
  });
  return toBookingProgress(updated);
};

/** Demo helper: advance booking through timeline for UI testing */
exports.simulateProgress = async (id) => {
  const booking = await detailingRepository.findBookingById(id);
  if (!booking) {
    throw new AppError("Detailing booking not found", 404);
  }

  const timeline = [...(booking.timeline || [])];
  const nextPending = timeline.findIndex((s) => s.status === "pending");
  if (nextPending === -1) {
    const updated = await detailingRepository.updateBooking(id, {
      status: "Completed",
      completedAt: nowIso(),
      durationMinutes: 260,
      bayLocation: booking.bayLocation || "Bay C-02",
      workCompleted: buildWorkCompleted(booking.packageKey, booking.addons),
      completionPhotoUrl: "/uploads/vehicles/sample-completed.jpg",
      estimatedMinutesRemaining: null,
    });
    return toJobDetail(updated);
  }

  if (nextPending > 0 && timeline[nextPending - 1].status === "active") {
    timeline[nextPending - 1] = {
      ...timeline[nextPending - 1],
      status: "completed",
      completedAt: nowIso(),
    };
  }

  const step = timeline[nextPending];
  timeline[nextPending] = {
    ...step,
    status: step.key === "completed_returned" ? "completed" : "active",
    completedAt: step.key === "completed_returned" ? nowIso() : null,
    meta:
      step.key === "vehicle_prepared"
        ? { bay: "Bay C-02" }
        : step.key === "detailing_in_progress"
          ? {
              estimatedMinutesRemaining: 45,
              estimatedCompletionTime: booking.timeWindowEnd || "14:00",
            }
          : step.meta,
  };

  const isLast = step.key === "completed_returned";
  const patch = {
    timeline,
    status: isLast ? "Completed" : "In Progress",
    bayLocation: booking.bayLocation || "Bay C-02",
    estimatedMinutesRemaining: step.key === "detailing_in_progress" ? 45 : null,
  };

  if (isLast) {
    patch.completedAt = nowIso();
    patch.durationMinutes = 260;
    patch.workCompleted = buildWorkCompleted(booking.packageKey, booking.addons);
    patch.completionPhotoUrl = "/uploads/vehicles/sample-completed.jpg";
    patch.estimatedMinutesRemaining = null;
    patch.assignedStaff = {
      ...DEFAULT_CONCIERGE,
      technicianName: "Saeed Ahmed",
      role: "Detailer",
    };
  } else if (nextPending === 1) {
    patch.status = "Confirmed";
    patch.assignedStaff = {
      ...DEFAULT_CONCIERGE,
      technicianName: "Saeed Ahmed",
      role: "Detailer",
    };
  }

  const updated = await detailingRepository.updateBooking(id, patch);
  return isLast ? toJobDetail(updated) : toBookingProgress(updated);
};

exports.reviewPayload = async (body) => {
  const { payload, pricing } = preparePayload(body);
  const vehicle = await Vehicle.findByPk(payload.vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  return {
    review: buildReviewSummary(payload, vehicle, pricing),
  };
};
