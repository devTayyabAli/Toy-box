const { WIZARD_STEPS, WIZARD_HEALTH_CATEGORIES, DOCUMENT_FIELDS } = require("./rides.constants");

function normalizeDoc(value) {
  if (!value) return { url: null, uploadedAt: null };
  if (typeof value === "string") return { url: value, uploadedAt: null };
  return {
    url: value.url || null,
    uploadedAt: value.uploadedAt || null,
  };
}

function formatHealthItems(health) {
  const items = Array.isArray(health) ? health : [];
  const labelByKey = Object.fromEntries(
    WIZARD_HEALTH_CATEGORIES.map((c) => [c.key, c.label]),
  );
  return items.map((item) => ({
    category: item.category,
    label: labelByKey[item.category] || item.category,
    percentage: item.percentage ?? 0,
    note: item.note || "",
  }));
}

function formatVehicleWizard(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === v.registrationStep);
  const currentStep = stepIndex >= 0 ? WIZARD_STEPS[stepIndex] : WIZARD_STEPS[0];

  const documents = {};
  for (const field of DOCUMENT_FIELDS) {
    const entry = normalizeDoc((v.documents || {})[field.key]);
    documents[field.key] = {
      ...entry,
      label: field.label,
      isUploaded: Boolean(entry.url),
    };
  }

  return {
    id: v.id,
    memberId: v.memberId,
    ownershipType: v.ownershipType || (v.memberId ? "member" : "inventory"),
    registrationStep: v.registrationStep,
    status: v.status,
    wizard: {
      currentStep: currentStep.key,
      currentStepNumber: currentStep.step,
      currentStepLabel: currentStep.label,
      steps: WIZARD_STEPS,
      isComplete: v.registrationStep === "complete",
    },
    vehicleInfo: {
      name: v.make,
      make: v.make,
      model: v.model,
      year: v.year,
      engine: v.engine,
      power: v.power,
      maxTorque: v.maxTorque,
      transmission: v.transmission,
      drive: v.drive,
      zeroToHundred: v.zeroToHundred,
      topSpeed: v.topSpeed,
      fuelType: v.fuelType,
      vehicleType: v.vehicleType,
    },
    ownershipInfo: {
      colour: v.colour,
      chassisNo: v.chassisNo,
      plate: v.plate,
      purchasedAt: v.purchasedAt,
      storageBay: v.storageBay,
      mileage: v.mileage,
    },
    documents,
    health: formatHealthItems(v.health),
    imageUrl: v.imageUrl,
    isPriority: v.isPriority,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

module.exports = {
  formatVehicleWizard,
  formatHealthItems,
  normalizeDoc,
};
