"use strict";

const pushNotificationService = require("./pushNotification.service");
const pushDevicesRepository = require("../modules/notifications/pushDevices.repository");
const notificationsRepository = require("../modules/notifications/notifications.repository");
const {
  normalizeStored,
  evaluatePushDelivery,
  getUnreadBadge,
} = require("../modules/notifications/notificationPreferences");

async function shouldSendPush(memberId, type = "general") {
  const row = await notificationsRepository.findMemberNotificationColumn(memberId);
  if (!row) return { allowed: false, reason: "member_not_found" };
  const settings = normalizeStored(row.notificationSettings);
  return evaluatePushDelivery(settings, type);
}

/**
 * Send push to all registered devices for a member.
 * @param {number} memberId
 * @param {{ title: string, body?: string, data?: object, type?: string, badge?: number, persistInbox?: boolean }} payload
 */
exports.sendToUser = async (memberId, payload = {}) => {
  const { title, body, data, type = "general", badge, persistInbox = true } = payload;
  if (!title) {
    return { sent: false, reason: "title_required" };
  }

  const gate = await shouldSendPush(memberId, type);
  if (!gate.allowed) {
    return { sent: false, reason: gate.reason, push: { sent: 0, failed: 0 } };
  }

  let inboxItem = null;
  if (persistInbox) {
    inboxItem = await notificationsRepository.createInboxItem({
      memberId,
      type,
      title,
      body: body || null,
      metadata: data || {},
    });
  }

  const devices = await pushDevicesRepository.findActiveByMember(memberId);
  if (!devices.length) {
    return {
      sent: false,
      reason: "no_devices",
      inboxId: inboxItem?.id,
      push: { sent: 0, failed: 0 },
    };
  }

  const resolvedBadge = badge ?? (await getUnreadBadge(memberId));

  const pushResult = await pushNotificationService.sendMulticast(
    devices.map((d) => ({ id: d.id, token: d.token, platform: d.platform })),
    { title, body, data, badge: resolvedBadge },
  );

  const staleIds = [];
  for (const r of pushResult.results) {
    if (r.invalidToken) {
      const device = devices.find((d) => d.token === r.token);
      if (device) staleIds.push(device.id);
    }
  }
  if (staleIds.length) {
    await pushDevicesRepository.deactivateByIds(staleIds);
  }

  return {
    sent: pushResult.sent > 0,
    inboxId: inboxItem?.id,
    push: pushResult,
  };
};

exports.sendToToken = pushNotificationService.sendToToken;
