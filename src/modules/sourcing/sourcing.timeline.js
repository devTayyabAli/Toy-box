const STEPS = [
  { key: "request_received", label: "Request received" },
  { key: "searching", label: "Searching for vehicle" },
  { key: "vehicle_found", label: "Vehicle found" },
  { key: "inspection_in_progress", label: "Inspection in progress" },
  { key: "offer_ready", label: "Offer ready" },
  { key: "completed", label: "Completed" },
];

function nowIso() {
  return new Date().toISOString();
}

function buildInitialTimeline() {
  return STEPS.map((step, i) => ({
    key: step.key,
    label: step.label,
    status: i === 0 ? "completed" : "pending",
    completedAt: i === 0 ? nowIso() : null,
  }));
}

function sampleMatches(make, model) {
  return [
    {
      id: "match-1",
      make,
      model,
      year: 2024,
      colour: "GT Silver Metallic",
      priceAed: 1250000,
      currency: "AED",
      status: "proposed",
      imageUrl: null,
    },
    {
      id: "match-2",
      make,
      model,
      year: 2023,
      colour: "Arctic Grey",
      priceAed: 1180000,
      currency: "AED",
      status: "proposed",
      imageUrl: null,
    },
  ];
}

module.exports = { STEPS, buildInitialTimeline, sampleMatches, nowIso };
