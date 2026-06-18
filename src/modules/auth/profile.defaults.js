const MEMBERSHIP_TIERS = {
  access: { key: "access", label: "Access", description: "Facilities and environment access only." },
  private: {
    key: "private",
    label: "Private",
    description: "Secure vehicle storage without administrative handling.",
  },
  principal: {
    key: "principal",
    label: "Principal",
    description: "Manages ownership with structured access and services.",
  },
  black_card: {
    key: "black_card",
    label: "Black Card",
    description: "Complete delegation and absolute discretion.",
  },
};

const DEFAULT_PRIVACY_SETTINGS = {
  biometricUnlockEnabled: false,
  profileVisibility: "members_only",
  showAtClub: true,
  eventsAttendanceVisibility: "members_only",
  vehicleVisibility: "private",
};

function clonePrivacyDefaults() {
  return typeof structuredClone === "function"
    ? structuredClone(DEFAULT_PRIVACY_SETTINGS)
    : JSON.parse(JSON.stringify(DEFAULT_PRIVACY_SETTINGS));
}

function normalizePrivacySettings(raw) {
  const base = clonePrivacyDefaults();
  if (!raw || typeof raw !== "object") return base;
  return { ...base, ...raw };
}

function mergePrivacyPatch(current, patch) {
  const next = normalizePrivacySettings(current);
  if (!patch || typeof patch !== "object") return next;
  return { ...next, ...patch };
}

module.exports = {
  MEMBERSHIP_TIERS,
  DEFAULT_PRIVACY_SETTINGS,
  clonePrivacyDefaults,
  normalizePrivacySettings,
  mergePrivacyPatch,
};
