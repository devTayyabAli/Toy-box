const { buildLineItems } = require("./maintenance.data");

const STEPS = [
  { key: "request_sent", label: "Request sent" },
  { key: "vehicle_picked_up", label: "Vehicle picked up" },
  { key: "service_in_progress", label: "Service in progress" },
  { key: "awaiting_approval", label: "Awaiting approval" },
  { key: "ready_for_delivery", label: "Ready for delivery" },
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

function buildChecklist(serviceKeys = []) {
  const items = [];
  if (serviceKeys.includes("oil_change")) {
    items.push({ key: "oil_replaced", label: "Engine oil replaced", done: false });
  }
  if (serviceKeys.includes("brake_pads")) {
    items.push({ key: "brake_checked", label: "Brake pads checked", done: false });
  }
  if (serviceKeys.includes("tire_rotation")) {
    items.push({ key: "tires_rotated", label: "Tires rotated & balanced", done: false });
  }
  if (serviceKeys.includes("annual_service")) {
    items.push({ key: "annual_inspection", label: "Annual inspection completed", done: false });
  }
  if (!items.length) {
    items.push({ key: "general_inspection", label: "General inspection completed", done: false });
  }
  return items;
}

function applyLineItemsForApproval(serviceKeys) {
  const lineItems = buildLineItems(serviceKeys);
  const totalAmount = lineItems.reduce((s, i) => s + i.amountAed, 0);
  return { lineItems, totalAmount };
}

module.exports = {
  STEPS,
  buildInitialTimeline,
  buildChecklist,
  applyLineItemsForApproval,
  nowIso,
};
