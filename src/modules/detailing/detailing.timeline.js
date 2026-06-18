const { TIMELINE_STEPS, DEFAULT_CONCIERGE } = require("./detailing.constants");
const { getAddons } = require("./detailing.data");

function nowIso() {
  return new Date().toISOString();
}

function buildInitialTimeline(addonKeys = []) {
  const addons = getAddons(addonKeys);
  const hasCeramic = addons.some((a) => a.key === "ceramic_coat");

  const steps = TIMELINE_STEPS.filter((s) => !s.optional || (s.key === "ceramic_coat_application" && hasCeramic));

  return steps.map((step, index) => ({
    key: step.key,
    label: step.label,
    status: index === 0 ? "completed" : "pending",
    completedAt: index === 0 ? nowIso() : null,
    meta: null,
  }));
}

function enrichTimelineStep(step) {
  if (step.key === "confirmed_by_concierge" && step.status === "completed") {
    return {
      ...step,
      meta: { staffName: DEFAULT_CONCIERGE.name, staffRole: DEFAULT_CONCIERGE.role },
    };
  }
  if (step.key === "vehicle_prepared" && step.status === "completed") {
    return { ...step, meta: { bay: step.meta?.bay || "Bay C-02" } };
  }
  if (step.key === "detailing_in_progress" && step.status === "active") {
    return {
      ...step,
      label: step.label,
      meta: {
        estimatedMinutesRemaining: step.meta?.estimatedMinutesRemaining ?? 45,
        estimatedCompletionTime: step.meta?.estimatedCompletionTime || null,
      },
    };
  }
  return step;
}

function formatTimeline(timeline = []) {
  return timeline.map(enrichTimelineStep);
}

function buildWorkCompleted(packageKey, addonKeys = []) {
  const items = [];
  if (packageKey === "full_detail" || packageKey === "interior_only") {
    items.push({
      key: "interior_deep_clean",
      label: "Full interior deep clean & leather conditioning",
      done: true,
    });
  }
  if (packageKey === "full_detail" || packageKey === "exterior_wash") {
    items.push({
      key: "exterior_detail",
      label: "Claybar, hand wash, & paint decontamination",
      done: true,
    });
  }
  if (packageKey === "full_detail") {
    items.push({ key: "engine_bay", label: "Engine bay touch up & cleaning", done: true });
  }
  const addons = getAddons(addonKeys);
  if (addons.some((a) => a.key === "ceramic_coat")) {
    items.push({
      key: "ceramic_coat",
      label: "Ceramic coat applied — 3 year protection",
      done: true,
    });
  }
  if (addons.some((a) => a.key === "leather_protection")) {
    items.push({ key: "leather", label: "Leather protection applied", done: true });
  }
  return items;
}

module.exports = {
  buildInitialTimeline,
  formatTimeline,
  buildWorkCompleted,
  nowIso,
};
