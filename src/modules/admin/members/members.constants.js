"use strict";

const MEMBERSHIP_TIER_KEYS = ["access", "private", "principal", "black_card"];

const MEMBERSHIP_TIER_FILTERS = [
  { key: "all", label: "ALL" },
  { key: "access", label: "ACCESS" },
  { key: "private", label: "PRIVATE" },
  { key: "principal", label: "PRINCIPLE" },
  { key: "black_card", label: "BLACK CARD" },
];

const VALIDITY_MONTHS_OPTIONS = [6, 12, 24, 36];

const DESIGNATION_ALIASES = {
  access: "access",
  "access member": "access",
  private: "private",
  "private member": "private",
  principal: "principal",
  principle: "principal",
  "principle member": "principal",
  "principal member": "principal",
  black_card: "black_card",
  "black card": "black_card",
  "black card member": "black_card",
  vip: "black_card",
};

function normalizeMembershipTier(value) {
  if (!value) return "principal";
  const key = String(value).trim().toLowerCase().replace(/\s+/g, " ");
  if (MEMBERSHIP_TIER_KEYS.includes(key)) return key;
  return DESIGNATION_ALIASES[key] || key.replace(/\s+/g, "_");
}

function tierLabel(key) {
  const labels = {
    access: "ACCESS",
    private: "PRIVATE",
    principal: "PRINCIPLE",
    black_card: "BLACK CARD",
  };
  return labels[key] || String(key || "").toUpperCase();
}

function parseFullName(fullName) {
  const trimmed = String(fullName || "").trim();
  if (!trimmed) return { firstName: null, lastName: null, name: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null, name: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    name: trimmed,
  };
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

module.exports = {
  MEMBERSHIP_TIER_KEYS,
  MEMBERSHIP_TIER_FILTERS,
  VALIDITY_MONTHS_OPTIONS,
  normalizeMembershipTier,
  tierLabel,
  parseFullName,
  addMonths,
};
