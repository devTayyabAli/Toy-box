const AppError = require("../../utils/AppError");
const { Notification } = require("../../models");
const firebaseService = require("../../services/firebase.service");
const notificationsRepository = require("./notifications.repository");
const pushDevicesRepository = require("./pushDevices.repository");
const { notifyMember } = require("./notifications.dispatch");
const {
  TIME_RE,
  cloneDefaults,
  normalizeStored,
} = require("./notificationPreferences");

function mergePatch(current, patch) {
  const next = typeof structuredClone === "function"
    ? structuredClone(current)
    : JSON.parse(JSON.stringify(current));
  for (const section of Object.keys(patch)) {
    if (patch[section] && typeof patch[section] === "object" && !Array.isArray(patch[section])) {
      next[section] = { ...(next[section] || {}), ...patch[section] };
    }
  }
  return next;
}

function assertTimes(settings) {
  const check = (label, value) => {
    if (value == null) return;
    if (!TIME_RE.test(String(value))) {
      throw new AppError(`${label} must be HH:mm (24h)`, 400);
    }
  };
  check("preferences.emailDigestTime", settings.preferences?.emailDigestTime);
  check("quietHours.quietHoursStart", settings.quietHours?.quietHoursStart);
  check("quietHours.quietHoursEnd", settings.quietHours?.quietHoursEnd);
}

exports.getDefaults = () => cloneDefaults();

exports.getSettings = async (memberId) => {
  const row = await notificationsRepository.findMemberNotificationColumn(memberId);
  if (!row) {
    throw new AppError("Member not found", 404);
  }
  return normalizeStored(row.notificationSettings);
};

function formatNotification(n) {
  const row = n.get ? n.get({ plain: true }) : n;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.isRead,
    readAt: row.readAt,
    metadata: row.metadata || {},
    createdAt: row.createdAt,
  };
}

async function seedIfEmpty(memberId) {
  const existing = await notificationsRepository.findInbox(memberId, { limit: 1 });
  if (existing.length) return;
  const seeds = [
    {
      memberId,
      type: "booking",
      title: "Welcome to Toybox",
      body: "Your garage is ready. Add your first vehicle to get started.",
    },
    {
      memberId,
      type: "events",
      title: "New club drive",
      body: "RSVP for this week's featured drive from the Events tab.",
    },
  ];
  for (const s of seeds) {
    await notificationsRepository.createInboxItem(s);
  }
}

exports.listInbox = async (memberId, query = {}) => {
  const row = await notificationsRepository.findMemberNotificationColumn(memberId);
  if (!row) throw new AppError("Member not found", 404);
  await seedIfEmpty(memberId);
  const items = await notificationsRepository.findInbox(memberId, {
    unreadOnly: query.unreadOnly === true || query.unreadOnly === "true",
    limit: query.limit || 50,
  });
  const unreadCount = await Notification.count({
    where: { memberId, isRead: false },
  });
  return {
    notifications: items.map(formatNotification),
    unreadCount,
  };
};

exports.markInboxRead = async (memberId, notificationId) => {
  const updated = await notificationsRepository.markRead(notificationId, memberId);
  if (!updated) throw new AppError("Notification not found", 404);
  return formatNotification(updated);
};

exports.markAllInboxRead = async (memberId) => {
  const [count] = await notificationsRepository.markAllRead(memberId);
  return { markedRead: count };
};

exports.updateSettings = async (memberId, patch) => {
  const row = await notificationsRepository.findMemberNotificationColumn(memberId);
  if (!row) {
    throw new AppError("Member not found", 404);
  }
  const current = normalizeStored(row.notificationSettings);
  const merged = mergePatch(current, patch);
  assertTimes(merged);
  await notificationsRepository.updateMemberNotificationSettings(memberId, merged);
  return merged;
};

exports.getFirebaseClientConfig = () => {
  const config = firebaseService.getClientConfig();
  if (!config) {
    throw new AppError("Firebase client is not configured", 503);
  }
  return config;
};

exports.getPushStatus = async (memberId) => {
  const deviceRows = await pushDevicesRepository.findActiveByMember(memberId);
  return {
    ...firebaseService.getStatus(),
    registeredDevices: deviceRows.length,
  };
};

exports.sendTestPush = async (memberId, body = {}) => {
  if (!firebaseService.isAdminEnabled()) {
    throw new AppError(
      "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_PATH in .env (see secrets/README.md).",
      503,
    );
  }

  const title = body.title || "Toy-Box test notification";
  const messageBody = body.body || "Push notifications are working.";
  const type = body.type || "general";

  return notifyMember(memberId, {
    title,
    body: messageBody,
    type,
    data: { test: true, ...(body.data || {}) },
  });
};

exports.notifyMember = notifyMember;
