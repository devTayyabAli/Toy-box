"use strict";

const { Notification } = require("../../models");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const DEFAULT_SETTINGS = {
  preferences: {
    pushEnabled: true,
    emailEnabled: true,
    emailDigestTime: "09:00",
    smsEnabled: false,
  },
  fromTheClub: {
    messagesFromJamesEnabled: true,
    vehicleStatusEnabled: true,
    eventsInvitationsEnabled: true,
    announcementsEnabled: true,
  },
  quietHours: {
    doNotDisturbEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
};

const CATEGORY_TO_CLUB_KEY = {
  vehicle_status: "vehicleStatusEnabled",
  transport: "vehicleStatusEnabled",
  booking: "vehicleStatusEnabled",
  events: "eventsInvitationsEnabled",
  messages: "messagesFromJamesEnabled",
  announcement: "announcementsEnabled",
  general: "announcementsEnabled",
};

function cloneDefaults() {
  return typeof structuredClone === "function"
    ? structuredClone(DEFAULT_SETTINGS)
    : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

function normalizeStored(raw) {
  const base = cloneDefaults();
  if (!raw || typeof raw !== "object") return base;
  for (const key of Object.keys(base)) {
    if (raw[key] && typeof raw[key] === "object") {
      base[key] = { ...base[key], ...raw[key] };
    }
  }
  return base;
}

function parseTimeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

function isWithinQuietHours(settings) {
  const qh = settings.quietHours;
  if (qh.doNotDisturbEnabled) return true;
  if (!qh.quietHoursEnabled) return false;

  const start = qh.quietHoursStart || "22:00";
  const end = qh.quietHoursEnd || "07:00";
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startM = parseTimeToMinutes(start);
  const endM = parseTimeToMinutes(end);

  if (startM <= endM) {
    return minutes >= startM && minutes < endM;
  }
  return minutes >= startM || minutes < endM;
}

function isCategoryAllowed(settings, type) {
  const key = CATEGORY_TO_CLUB_KEY[type] || CATEGORY_TO_CLUB_KEY.general;
  return settings.fromTheClub[key] !== false;
}

function evaluatePushDelivery(settings, type) {
  if (!settings.preferences.pushEnabled) {
    return { allowed: false, reason: "push_disabled" };
  }
  if (!isCategoryAllowed(settings, type)) {
    return { allowed: false, reason: "category_disabled" };
  }
  if (isWithinQuietHours(settings)) {
    return { allowed: false, reason: "quiet_hours" };
  }
  return { allowed: true };
}

async function getUnreadBadge(memberId) {
  const count = await Notification.count({
    where: { memberId, isRead: false },
  });
  return count > 0 ? count : undefined;
}

module.exports = {
  TIME_RE,
  DEFAULT_SETTINGS,
  cloneDefaults,
  normalizeStored,
  evaluatePushDelivery,
  getUnreadBadge,
};
