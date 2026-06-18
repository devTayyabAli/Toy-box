const SERVICE_TYPES = [
  { key: "oil_change", name: "Oil Change", priceAed: 120, estimatedMinutes: 45 },
  { key: "brake_pads", name: "Brake Pads", priceAed: 250, estimatedMinutes: 90 },
  { key: "tire_rotation", name: "Tire Rotation", priceAed: 80, estimatedMinutes: 30 },
  { key: "annual_service", name: "Annual Service", priceAed: 650, estimatedMinutes: 180 },
  { key: "battery_check", name: "Battery Check", priceAed: 60, estimatedMinutes: 20 },
  { key: "ac_service", name: "A/C Service", priceAed: 180, estimatedMinutes: 60 },
];

const LOCATIONS = [
  {
    key: "toybox_main",
    name: "Toybox Main Garage",
    address: "Level 1, Toybox Club",
  },
  {
    key: "toybox_bay_c",
    name: "Service Bay C",
    address: "Bay C-02, Level 1",
  },
  {
    key: "partner_porsche",
    name: "Partner — Porsche Centre",
    address: "Sheikh Zayed Road, Dubai",
  },
];

function getServices(keys = []) {
  return keys.map((k) => SERVICE_TYPES.find((s) => s.key === k)).filter(Boolean);
}

function calculateTotal(serviceKeys = []) {
  const services = getServices(serviceKeys);
  if (!services.length) return null;
  return {
    services,
    subtotalAed: services.reduce((sum, s) => sum + s.priceAed, 0),
    currency: "AED",
  };
}

function buildLineItems(serviceKeys = []) {
  return getServices(serviceKeys).map((s) => ({
    key: s.key,
    label: s.name,
    amountAed: s.priceAed,
    currency: "AED",
  }));
}

module.exports = {
  SERVICE_TYPES,
  LOCATIONS,
  getServices,
  calculateTotal,
  buildLineItems,
};
