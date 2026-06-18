const { Op } = require("sequelize");
const {
  HEALTH_LABELS,
  DOCUMENT_SECTIONS,
  QUICK_ACTIONS,
  DEFAULT_FULL_HEALTH_REPORT,
  GARAGE_STATUS_MAP,
  GARAGE_STATUS_UI_LABELS,
  GARAGE_OVERVIEW_QUICK_ACTIONS,
} = require("./garage.constants");

function resolveHealthItems(health) {
  const items = Array.isArray(health) && health.length ? health : DEFAULT_FULL_HEALTH_REPORT;
  return parseHealth(items);
}

function parseHealth(health) {
  const items = Array.isArray(health) ? health : [];
  return items.map((item) => ({
    category: item.category,
    label: HEALTH_LABELS[item.category] || item.category,
    percentage: item.percentage ?? 0,
    note: item.note || null,
  }));
}

function overallHealthPercent(healthItems) {
  if (!healthItems.length) {
    return null;
  }
  const sum = healthItems.reduce((acc, h) => acc + (h.percentage ?? 0), 0);
  return Math.round(sum / healthItems.length);
}

function displayName(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function resolveGarageStatusKey(status) {
  return GARAGE_STATUS_MAP[status] || "ready";
}

function garageStatusLabel(statusKey) {
  return GARAGE_STATUS_UI_LABELS[statusKey] || "Ready";
}

function garageSubtitle(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const parts = [v.year, v.colour].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function formatMileage(mileage) {
  if (mileage == null || mileage === "") {
    return null;
  }
  const raw = String(mileage).trim();
  if (/km/i.test(raw)) {
    return raw;
  }
  const num = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isNaN(num) && raw !== "") {
    return `${num} km`;
  }
  return raw;
}

function buildGarageSummaryLabel(count, location) {
  const word = count === 1 ? "Vehicle" : "Vehicles";
  const base = `${count} ${word}`;
  const place = location?.trim();
  return place ? `${base} · ${place}` : base;
}

function toGarageOverviewCard(vehicle, { isSelected = false } = {}) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const healthItems = resolveHealthItems(v.health);
  const statusKey = resolveGarageStatusKey(v.status);

  return {
    id: v.id,
    title: displayName(v),
    subtitle: garageSubtitle(v),
    statusLabel: garageStatusLabel(statusKey),
    statusKey,
    healthPercent: overallHealthPercent(healthItems),
    imageUrl: v.imageUrl || null,
    isSelected: Boolean(isSelected),
  };
}

function toGarageFeaturedVehicle(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const card = toGarageOverviewCard(vehicle, { isSelected: true });

  return {
    ...card,
    mileage: formatMileage(v.mileage),
    quickActions: GARAGE_OVERVIEW_QUICK_ACTIONS,
  };
}

function normalizeDocEntry(value) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return { url: value, expiresAt: null, uploadedAt: null };
  }
  return {
    url: value.url || null,
    expiresAt: value.expiresAt || null,
    uploadedAt: value.uploadedAt || null,
  };
}

function formatLastServiced(date) {
  if (!date) {
    return null;
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function toGarageListItem(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const healthItems = resolveHealthItems(v.health);
  const statusKey = resolveGarageStatusKey(v.status);
  return {
    id: v.id,
    displayName: displayName(v),
    make: v.make,
    model: v.model,
    year: v.year,
    imageUrl: v.imageUrl,
    colour: v.colour,
    vehicleType: v.vehicleType || "car",
    isPriority: Boolean(v.isPriority),
    status: v.status,
    statusKey,
    statusLabel: garageStatusLabel(statusKey),
    memberId: v.memberId,
    healthPercent: overallHealthPercent(healthItems),
    storageBay: v.storageBay,
    fuelLevel: v.fuelLevel,
    fuelStatus: formatFuelStatus(v.fuelLevel),
  };
}

function formatFuelStatus(fuelLevel) {
  if (!fuelLevel) return null;
  const v = String(fuelLevel).toLowerCase();
  if (v.includes("low")) return { level: fuelLevel, label: "Low fuel", isLow: true };
  return { level: fuelLevel, label: fuelLevel, isLow: false };
}

function toVehicleDetails(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const healthItems = resolveHealthItems(v.health);
  const overall = overallHealthPercent(healthItems);
  const highlights = ["tyres", "fluids", "battery", "battery_health", "engine_performance"]
    .map((cat) => healthItems.find((h) => h.category === cat))
    .filter(Boolean);

  return {
    id: v.id,
    displayName: displayName(v),
    make: v.make,
    model: v.model,
    year: v.year,
    imageUrl: v.imageUrl,
    colour: v.colour,
    vehicleType: v.vehicleType || "car",
    isPriority: Boolean(v.isPriority),
    status: v.status,
    memberId: v.memberId,
    ownerName: v.ownerName,
    quickStats: {
      mileage: v.mileage,
      lastServiced: formatLastServiced(v.lastServicedAt),
      engine: v.engine,
      storageLocation: v.storageBay,
      fuelType: v.fuelType,
      fuelLevel: v.fuelLevel,
      fuelStatus: formatFuelStatus(v.fuelLevel),
    },
    healthSummary: {
      overallPercent: overall,
      highlights,
    },
    quickActions: QUICK_ACTIONS,
    recentActions: [],
  };
}

function toHealthReport(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const items = resolveHealthItems(v.health);
  const report = {
    vehicleId: v.id,
    displayName: displayName(v),
    overallPercent: overallHealthPercent(items),
    items,
    generatedAt: new Date().toISOString(),
  };
  report.download = {
    fileName: `health-report-${v.id}.json`,
    contentType: "application/json",
    data: {
      vehicleId: report.vehicleId,
      displayName: report.displayName,
      overallPercent: report.overallPercent,
      items: report.items,
      generatedAt: report.generatedAt,
    },
  };
  return report;
}

function toSpecs(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return {
    vehicleId: v.id,
    displayName: displayName(v),
    generalInfo: {
      make: v.make,
      model: v.model,
      year: v.year,
      vin: v.chassisNo,
      engineType: v.engine,
      transmission: v.transmission,
      fuelType: v.fuelType,
      exteriorColor: v.colour,
      interiorColor: v.interiorColor,
    },
    vehicleSpecs: {
      brand: v.make,
      model: v.model,
      year: v.year,
      engine: v.engine,
      power: v.power,
      maxPower: v.power,
      transmission: v.transmission,
      drive: v.drive,
      zeroToHundred: v.zeroToHundred,
      topSpeed: v.topSpeed,
      colour: v.colour,
      fuelType: v.fuelType,
      interiorColor: v.interiorColor,
    },
    performance: {
      maxPower: v.power,
      maxTorque: v.maxTorque,
      zeroToHundred: v.zeroToHundred,
      topSpeed: v.topSpeed,
      fuelEfficiency: v.fuelEfficiency,
    },
    ownershipInfo: {
      ownerName: v.ownerName,
      vin: v.chassisNo,
      plate: v.plate,
      purchasedAt: v.purchasedAt,
      location: v.storageBay,
      mileage: v.mileage,
    },
  };
}

function toDocuments(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const raw = v.documents || {};
  const sections = DOCUMENT_SECTIONS.map((section) => ({
    key: section.key,
    title: section.title,
    items: section.items.map((item) => {
      const entry = normalizeDocEntry(raw[item.key]);
      return {
        key: item.key,
        label: item.label,
        url: entry?.url || null,
        expiresAt: entry?.expiresAt || null,
        uploadedAt: entry?.uploadedAt || null,
        isUploaded: Boolean(entry?.url),
      };
    }),
  }));

  return {
    vehicleId: v.id,
    displayName: displayName(v),
    sections,
  };
}

function toGarageRequest(request) {
  const r = request.get ? request.get({ plain: true }) : request;
  const vehicle = r.vehicle;
  const vehicleLabel = vehicle ? displayName(vehicle) : null;
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    status: r.status,
    memberId: r.memberId,
    vehicleId: r.vehicleId,
    vehicleLabel,
    notes: r.notes,
    scheduledAt: r.scheduledAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function buildVehicleSearchWhere(search) {
  if (!search?.trim()) {
    return {};
  }
  const q = `%${search.trim()}%`;
  return {
    [Op.or]: [
      { make: { [Op.iLike]: q } },
      { model: { [Op.iLike]: q } },
      { plate: { [Op.iLike]: q } },
      { chassisNo: { [Op.iLike]: q } },
      { colour: { [Op.iLike]: q } },
    ],
  };
}

module.exports = {
  toGarageListItem,
  toGarageOverviewCard,
  toGarageFeaturedVehicle,
  toVehicleDetails,
  toHealthReport,
  toSpecs,
  toDocuments,
  toGarageRequest,
  buildVehicleSearchWhere,
  buildGarageSummaryLabel,
  overallHealthPercent,
  displayName,
  resolveHealthItems,
  formatFuelStatus,
  resolveGarageStatusKey,
  garageStatusLabel,
  formatMileage,
};
