"use strict";

const READY_STATUSES = ["Available", "Ready", "Stored", "In storage"];
const IN_SERVICE_STATUSES = [
  "In Service",
  "In Progress",
  "Service in progress",
  "In review",
  "In Review",
];
const STORED_STATUSES = ["Stored", "In storage", "Available", "Ready"];

const SERVICE_OVERDUE_DAYS = Number(process.env.SERVICE_OVERDUE_DAYS || 365);
const TOTAL_STORAGE_BAYS = Number(process.env.STAFF_STORAGE_TOTAL_BAYS || 301);

const LEVEL_01_BAYS = [
  "A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10",
  "B01", "B02", "B03",
];

const FLEET_BASE_WHERE = {
  registrationStep: "complete",
};

function normalizeBayId(storageBay) {
  if (!storageBay) return null;
  const s = String(storageBay).trim();
  const direct = s.match(/^([AB])(\d{2})$/i);
  if (direct) return `${direct[1].toUpperCase()}${direct[2]}`;
  const embedded = s.match(/([AB])[\s-]?(\d{1,2})\b/i);
  if (embedded) {
    return `${embedded[1].toUpperCase()}${String(embedded[2]).padStart(2, "0")}`;
  }
  return s;
}

module.exports = {
  READY_STATUSES,
  IN_SERVICE_STATUSES,
  STORED_STATUSES,
  SERVICE_OVERDUE_DAYS,
  TOTAL_STORAGE_BAYS,
  LEVEL_01_BAYS,
  FLEET_BASE_WHERE,
  normalizeBayId,
};
