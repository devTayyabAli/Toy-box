"use strict";

const {
  GARAGE_STATUS_MAP,
  GARAGE_STATUS_UI_LABELS,
} = require("../../garage/garage.constants");
const {
  LEVEL_01_BAYS,
  normalizeBayId,
} = require("./fleet.constants");
const { isOverdueVehicle } = require("./fleet.repository");

function displayName(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  return [v.make, v.model].filter(Boolean).join(" ");
}

function resolveOwnerName(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  if (v.ownerName?.trim()) return v.ownerName.trim();
  const owner = v.owner;
  if (!owner) return null;
  return (
    [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
    owner.name ||
    null
  );
}

function resolveOwner(vehicle) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const name = resolveOwnerName(vehicle);
  const owner = v.owner;
  return {
    id: owner?.id || v.memberId || null,
    name,
    profileImageUrl: owner?.profileImageUrl || null,
  };
}

function formatMileage(mileage) {
  if (mileage == null || mileage === "") return null;
  const raw = String(mileage).trim();
  if (/km/i.test(raw)) return raw;
  const num = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isNaN(num) && raw !== "") return `${num} km`;
  return raw;
}

function resolveStatusKey(status, overdue) {
  if (overdue) return "overdue";
  return GARAGE_STATUS_MAP[status] || "ready";
}

function resolveStatusLabel(statusKey) {
  if (statusKey === "overdue") return "Overdue";
  return GARAGE_STATUS_UI_LABELS[statusKey] || "Ready";
}

function formatShortDate(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatLastActivity(vehicle, statusKey) {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const at = v.updatedAt || v.lastServicedAt || v.createdAt;
  const dateLabel = formatShortDate(at);

  let prefix = "Updated";
  if (statusKey === "in_service" || statusKey === "service") {
    prefix = "Service started";
  } else if (statusKey === "ready") {
    prefix = "Ready since";
  } else if (statusKey === "stored") {
    prefix = "Stored since";
  }

  return {
    label: dateLabel ? `${prefix} ${dateLabel}` : prefix,
    at: at ? new Date(at).toISOString() : null,
  };
}

function formatTrend(delta, { unit = "", prefix = "" } = {}) {
  const value = Number(delta) || 0;
  if (value === 0) {
    return { direction: "flat", value: 0, displayValue: "0" };
  }
  const direction = value > 0 ? "up" : "down";
  const sign = value > 0 ? "+" : "";
  return {
    direction,
    value,
    displayValue: `${prefix}${sign}${value}${unit}`,
  };
}

exports.formatDashboardSummary = ({
  totalVehicles,
  inStorage,
  inService,
  bayUtilization,
  totalBays,
  vehiclesAddedThisMonth,
  bayUtilizationTrend,
}) => ({
  totalVehicles: {
    key: "total",
    label: "TOTAL VEHICLES",
    value: totalVehicles,
    subLabel: "ACTIVE",
    trend: formatTrend(vehiclesAddedThisMonth, { prefix: "^" }),
  },
  inStorage: {
    key: "in_storage",
    label: "IN STORAGE",
    value: inStorage,
    subLabel: "WORKSHOP",
  },
  inService: {
    key: "in_service",
    label: "IN SERVICE",
    value: inService,
    subLabel: "SERVICE WINDOW",
  },
  bayUtilization: {
    key: "bay_utilization",
    label: "BAY UTILIZATION",
    value: bayUtilization,
    displayValue: `${bayUtilization}%`,
    subLabel: "",
    ratio: {
      used: totalVehicles,
      total: totalBays,
      displayValue: `${totalVehicles} / ${totalBays}`,
    },
    trend: formatTrend(bayUtilizationTrend, { unit: "%", prefix: "^" }),
  },
});

exports.buildBayMap = (vehicles, level = "01") => {
  const bays = level === "01" ? LEVEL_01_BAYS : LEVEL_01_BAYS;
  const byBay = new Map();

  for (const vehicle of vehicles) {
    const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
    const bayId = normalizeBayId(v.storageBay);
    if (!bayId) continue;
    byBay.set(bayId, vehicle);
  }

  return {
    level,
    label: `Level ${level}`,
    bays: bays.map((bayId) => {
      const vehicle = byBay.get(bayId);
      if (!vehicle) {
        return {
          id: bayId,
          label: bayId,
          occupied: false,
          vehicleId: null,
          statusKey: "empty",
        };
      }

      const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
      const overdue = isOverdueVehicle(vehicle);
      const statusKey = resolveStatusKey(v.status, overdue);

      return {
        id: bayId,
        label: bayId,
        occupied: true,
        vehicleId: v.id,
        statusKey,
        vehicle: {
          id: v.id,
          displayName: displayName(v),
          memberName: resolveOwnerName(vehicle),
        },
      };
    }),
  };
};

exports.formatOperationItem = (vehicle) => {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const overdue = isOverdueVehicle(vehicle);
  const statusKey = resolveStatusKey(v.status, overdue);

  return {
    id: v.id,
    bay: normalizeBayId(v.storageBay) || v.storageBay || null,
    member: resolveOwner(vehicle),
    vehicle: {
      id: v.id,
      displayName: displayName(v),
      make: v.make,
      model: v.model,
      imageUrl: v.imageUrl || null,
    },
    status: v.status,
    statusKey,
    statusLabel: resolveStatusLabel(statusKey).toUpperCase(),
    lastActivity: formatLastActivity(vehicle, statusKey),
    canView: true,
  };
};

exports.formatFleetListItem = (vehicle) => {
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;
  const overdue = isOverdueVehicle(vehicle);
  const statusKey = resolveStatusKey(v.status, overdue);

  return {
    id: v.id,
    displayName: displayName(v),
    make: v.make,
    model: v.model,
    year: v.year,
    imageUrl: v.imageUrl || null,
    storageBay: v.storageBay || null,
    ownerName: resolveOwnerName(vehicle),
    memberId: v.memberId,
    mileage: formatMileage(v.mileage),
    status: v.status,
    statusKey,
    statusLabel: resolveStatusLabel(statusKey).toUpperCase(),
    isOverdueService: overdue,
    ownershipType: v.ownershipType,
    isPriority: Boolean(v.isPriority),
  };
};

exports.formatFleetDetail = (vehicle) => {
  const item = exports.formatFleetListItem(vehicle);
  const v = vehicle.get ? vehicle.get({ plain: true }) : vehicle;

  return {
    ...item,
    bay: normalizeBayId(v.storageBay) || v.storageBay || null,
    member: resolveOwner(vehicle),
    lastActivity: formatLastActivity(vehicle, item.statusKey),
    plate: v.plate || null,
    colour: v.colour || null,
    chassisNo: v.chassisNo || null,
    lastServicedAt: v.lastServicedAt || null,
    fuelLevel: v.fuelLevel || null,
    health: v.health || [],
    documents: v.documents || {},
  };
};
