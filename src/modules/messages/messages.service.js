const AppError = require("../../utils/AppError");
const { Member } = require("../../models");
const messagesRepository = require("./messages.repository");

const CONCIERGE_NAME = "James T.";

function formatMessage(m) {
  const row = m.get ? m.get({ plain: true }) : m;
  return {
    id: row.id,
    memberId: row.memberId,
    senderType: row.senderType,
    senderName: row.senderName,
    body: row.body,
    isRead: row.isRead,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

async function ensureThread(memberId) {
  const existing = await messagesRepository.findForMember(memberId, 1);
  if (existing.length) return;

  await messagesRepository.create({
    memberId,
    senderType: "concierge",
    senderName: CONCIERGE_NAME,
    body: "Hello — I'm James, your Toybox concierge. How can I help you today?",
    isRead: false,
  });
}

exports.list = async ({ memberId, limit }) => {
  const member = await Member.findByPk(memberId);
  if (!member) throw new AppError("Member not found", 404);
  await ensureThread(memberId);
  const rows = await messagesRepository.findForMember(memberId, limit);
  return {
    memberId,
    unreadCount: await messagesRepository.unreadCount(memberId),
    messages: rows.map(formatMessage),
  };
};

exports.send = async ({ memberId, body }) => {
  const member = await Member.findByPk(memberId);
  if (!member) throw new AppError("Member not found", 404);

  const memberMsg = await messagesRepository.create({
    memberId,
    senderType: "member",
    senderName: member.name || member.firstName || "Member",
    body,
    isRead: true,
    readAt: new Date(),
  });

  const reply = await messagesRepository.create({
    memberId,
    senderType: "concierge",
    senderName: CONCIERGE_NAME,
    body: "Thanks for your message. A concierge will follow up shortly.",
    isRead: false,
  });

  return {
    sent: formatMessage(memberMsg),
    autoReply: formatMessage(reply),
  };
};

exports.markRead = async (memberId) => {
  const updated = await messagesRepository.markAllRead(memberId);
  return { memberId, markedRead: updated };
};
