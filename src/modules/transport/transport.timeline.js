const STEPS = [
  { key: "request_sent", label: "Awaiting confirmation" },
  { key: "confirmed", label: "Confirmed by concierge" },
  { key: "vehicle_picked_up", label: "Vehicle picked up" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
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

module.exports = { buildInitialTimeline, nowIso, STEPS };
