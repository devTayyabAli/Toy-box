const { Member, Notification } = require("../../models");

exports.findMemberNotificationColumn = (memberId) =>
  Member.findByPk(memberId, {
    attributes: ["id", "notificationSettings"],
  });

exports.updateMemberNotificationSettings = (memberId, settings) =>
  Member.update({ notificationSettings: settings }, { where: { id: memberId } });

exports.findInbox = (memberId, { unreadOnly, limit }) => {
  const where = { memberId };
  if (unreadOnly) where.isRead = false;
  return Notification.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: limit || 50,
  });
};

exports.findInboxItem = (id, memberId) =>
  Notification.findOne({ where: { id, memberId } });

exports.createInboxItem = (data) => Notification.create(data);

exports.markRead = async (id, memberId) => {
  const row = await exports.findInboxItem(id, memberId);
  if (!row) return null;
  await row.update({ isRead: true, readAt: new Date() });
  return row;
};

exports.markAllRead = (memberId) =>
  Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { memberId, isRead: false } },
  );
