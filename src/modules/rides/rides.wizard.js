const AppError = require("../../utils/AppError");
const { WIZARD_HEALTH_KEYS } = require("./rides.constants");

const STEP_FLOW = {
  vehicle_info: "ownership",
  ownership: "docs",
  docs: "health",
  health: "complete",
};

function assertWizardHealth(health) {
  if (!Array.isArray(health) || !health.length) {
    throw new AppError("health array is required", 400);
  }
  const keys = new Set(health.map((h) => h.category));
  const missing = WIZARD_HEALTH_KEYS.filter((k) => !keys.has(k));
  if (missing.length) {
    throw new AppError(
      `health must include all categories: ${WIZARD_HEALTH_KEYS.join(", ")}. Missing: ${missing.join(", ")}`,
      400,
    );
  }
}

function assertReadyForComplete(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  if (!v.make || !v.model || !v.year) {
    throw new AppError("Vehicle info (make, model, year) is incomplete", 400);
  }
  if (!v.chassisNo || !v.plate || !v.colour) {
    throw new AppError("Ownership info is incomplete", 400);
  }
  assertWizardHealth(v.health);
}

function resolveNextStep(requestedStep, patch, existingStep) {
  if (requestedStep === "complete") {
    return "complete";
  }
  if (requestedStep) {
    return requestedStep;
  }
  if (patch.vehicleInfo && existingStep === "vehicle_info") {
    return STEP_FLOW.vehicle_info;
  }
  if (patch.ownershipInfo || patch.chassisNo) {
    return patch.registrationStep || STEP_FLOW.ownership;
  }
  return existingStep;
}

module.exports = {
  STEP_FLOW,
  assertWizardHealth,
  assertReadyForComplete,
  resolveNextStep,
};
