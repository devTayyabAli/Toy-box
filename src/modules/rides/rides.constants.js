const WIZARD_STEPS = [
  { key: "vehicle_info", label: "Vehicle Info", step: 1 },
  { key: "ownership", label: "Ownership Info", step: 2 },
  { key: "docs", label: "Docs", step: 3 },
  { key: "health", label: "Health", step: 4 },
  { key: "complete", label: "Complete", step: 5 },
];

const WIZARD_HEALTH_CATEGORIES = [
  { key: "engine_drivetrain", label: "Engine & Drivetrain" },
  { key: "tyres", label: "Tyres" },
  { key: "brakes", label: "Brakes" },
  { key: "fluids", label: "Fluids" },
  { key: "battery", label: "Battery" },
  { key: "exterior_body", label: "Exterior & Body" },
];

const DOCUMENT_FIELDS = [
  { key: "vehicleRegistration", label: "Vehicle Registration" },
  { key: "insuranceCertificate", label: "Insurance Certificate" },
  { key: "specsAndInfo", label: "Specs and info" },
  { key: "serviceRecord", label: "Service Record" },
  { key: "purchasedInvoice", label: "Purchased Invoice" },
  { key: "warrantyCertificate", label: "Warranty Certificate" },
];

module.exports = {
  WIZARD_STEPS,
  WIZARD_HEALTH_CATEGORIES,
  DOCUMENT_FIELDS,
  WIZARD_HEALTH_KEYS: WIZARD_HEALTH_CATEGORIES.map((c) => c.key),
};
