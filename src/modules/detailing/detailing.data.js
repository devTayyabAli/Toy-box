/**
 * Detailing catalog (replace with CMS / DB later).
 */
const PACKAGES = [
  {
    key: "full_detail",
    name: "FULL DETAIL",
    priceAed: 850,
    currency: "AED",
    inclusions: ["Interior", "Exterior", "Engine bay"],
    estimatedMinutes: 180,
    description: "Complete interior and exterior detail with engine bay clean.",
  },
  {
    key: "exterior_wash",
    name: "EXTERIOR WASH",
    priceAed: 350,
    currency: "AED",
    inclusions: ["Exterior"],
    estimatedMinutes: 60,
    description: "Hand wash, dry, and wheel clean.",
  },
  {
    key: "interior_only",
    name: "INTERIOR ONLY",
    priceAed: 450,
    currency: "AED",
    inclusions: ["Interior"],
    estimatedMinutes: 90,
    description: "Deep vacuum, surfaces, and interior glass.",
  },
];

const ADDONS = [
  {
    key: "ceramic_coat",
    name: "Ceramic coat",
    priceAed: 1200,
    currency: "AED",
    description: "3 year paint protection",
    addsTimelineStep: "ceramic_coat_application",
  },
  {
    key: "leather_protection",
    name: "Leather protection",
    priceAed: 280,
    currency: "AED",
    description: "Condition and protect leather surfaces",
  },
  {
    key: "steam_clean",
    name: "Steam clean",
    priceAed: 180,
    currency: "AED",
    description: "Sanitize fabrics and hard-to-reach areas",
  },
  {
    key: "odor_removal",
    name: "Odor removal",
    priceAed: 220,
    currency: "AED",
    description: "Ozone / enzyme treatment",
  },
  {
    key: "engine_bay",
    name: "Engine bay",
    priceAed: 150,
    currency: "AED",
    description: "Degrease and dress engine bay",
  },
  {
    key: "wheel_ceramic",
    name: "Wheel ceramic",
    priceAed: 320,
    currency: "AED",
    description: "Ceramic protection for wheels",
  },
];

const { PACKAGE_KEY_ALIASES } = require("./detailing.constants");

function getPackage(key) {
  const normalized = PACKAGE_KEY_ALIASES[String(key || "").toLowerCase()] || key;
  return PACKAGES.find((p) => p.key === normalized);
}

function getAddons(keys = []) {
  return keys.map((key) => ADDONS.find((a) => a.key === key)).filter(Boolean);
}

function calculateTotal(packageKey, addonKeys = []) {
  const pkg = getPackage(packageKey);
  if (!pkg) {
    return null;
  }
  const addons = getAddons(addonKeys);
  const addonTotal = addons.reduce((sum, a) => sum + a.priceAed, 0);
  return {
    package: pkg,
    addons,
    subtotalAed: pkg.priceAed + addonTotal,
    currency: "AED",
  };
}

module.exports = {
  PACKAGES,
  ADDONS,
  getPackage,
  getAddons,
  calculateTotal,
};
