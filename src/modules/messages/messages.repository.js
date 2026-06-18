const { Message } = require("../../models");

exports.findForMember = (memberId, limit = 100) =>
  Message.findAll({
    where: { memberId },
    order: [["createdAt", "ASC"]],
    limit,
  });

exports.create = (data) => Message.create(data);

exports.markAllRead = async (memberId) => {
  const [count] = await Message.update(
    { isRead: true, readAt: new Date() },
    { where: { memberId, isRead: false } },
  );
  return count;
};

exports.unreadCount = (memberId) =>
  Message.count({ where: { memberId, isRead: false } });
