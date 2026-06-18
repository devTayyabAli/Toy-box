"use strict";

const notificationService = require("../../services/notification.service");
const notificationsRepository = require("./notifications.repository");
const {
  normalizeStored,
  evaluatePushDelivery,
  getUnreadBadge,
} = require("./notificationPreferences");

/**
 * Send inbox + push for a member, respecting notification settings.
 * @param {number} memberId
 * @param {{ title: string, body?: string, type?: string, data?: object, persistInbox?: boolean, skipPush?: boolean }} payload
 */
async function notifyMember(memberId, payload = {}) {
  const { title, body, data, type = "general", persistInbox = true, skipPush = false } =
    payload;

  if (!title) {
    return { sent: false, reason: "title_required" };
  }

  const row = await notificationsRepository.findMemberNotificationColumn(memberId);
  if (!row) {
    return { sent: false, reason: "member_not_found" };
  }

  const settings = normalizeStored(row.notificationSettings);
  const gate = evaluatePushDelivery(settings, type);

  if (!gate.allowed && !persistInbox) {
    return { sent: false, reason: gate.reason, push: { sent: 0, failed: 0 } };
  }

  if (skipPush || !gate.allowed) {
    if (!persistInbox) {
      return { sent: false, reason: gate.reason, push: { sent: 0, failed: 0 } };
    }
    const inboxItem = await notificationsRepository.createInboxItem({
      memberId,
      type,
      title,
      body: body || null,
      metadata: data || {},
    });
    return {
      sent: false,
      reason: gate.reason,
      inboxId: inboxItem.id,
      push: { sent: 0, failed: 0 },
    };
  }

  const badge = await getUnreadBadge(memberId);
  return notificationService.sendToUser(memberId, {
    title,
    body,
    data,
    type,
    badge,
    persistInbox,
  });
}

module.exports = { notifyMember };
