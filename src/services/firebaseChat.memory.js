"use strict";

const AppError = require("../utils/AppError");

const CONVERSATIONS_COLLECTION =
  process.env.FIRESTORE_CONVERSATIONS_COLLECTION || "conversations";
const MESSAGES_SUBCOLLECTION =
  process.env.FIRESTORE_MESSAGES_SUBCOLLECTION || "messages";
const CONCIERGE_NAME = process.env.CONCIERGE_NAME || "James T.";
const CONCIERGE_SENDER_ID = "concierge";

const conversations = new Map();
const messagesByConversation = new Map();
let messageSeq = 0;

function buildConversationId(memberId) {
  return `member_${Number(memberId)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function mapConversationRecord(conversationId, data) {
  return {
    conversationId,
    memberId: data.memberId,
    memberName: data.memberName,
    status: data.status,
    initiatedBy: data.initiatedBy,
    lastMessage: data.lastMessage,
    lastMessageAt: data.lastMessageAt,
    unreadForMember: data.unreadForMember ?? 0,
    unreadForAdmin: data.unreadForAdmin ?? 0,
    createdAt: data.createdAt,
    storage: "memory",
    firestorePath: `${CONVERSATIONS_COLLECTION}/${conversationId}`,
    messagesPath: `${CONVERSATIONS_COLLECTION}/${conversationId}/${MESSAGES_SUBCOLLECTION}`,
  };
}

function getMessages(conversationId) {
  if (!messagesByConversation.has(conversationId)) {
    messagesByConversation.set(conversationId, []);
  }
  return messagesByConversation.get(conversationId);
}

function appendMessage(conversationId, message, counters = {}) {
  const entry = {
    id: `msg_${++messageSeq}`,
    conversationId,
    senderId: message.senderId,
    senderType: message.senderType,
    senderName: message.senderName,
    body: message.body,
    createdAt: nowIso(),
  };

  getMessages(conversationId).push(entry);

  const conv = conversations.get(conversationId);
  if (conv) {
    conversations.set(conversationId, {
      ...conv,
      lastMessage: message.body,
      lastMessageAt: entry.createdAt,
      unreadForMember:
        counters.unreadForMember !== undefined
          ? conv.unreadForMember + counters.unreadForMember
          : conv.unreadForMember,
      unreadForAdmin:
        counters.unreadForAdmin !== undefined
          ? conv.unreadForAdmin + counters.unreadForAdmin
          : conv.unreadForAdmin,
    });
  }

  return entry;
}

exports.buildConversationId = buildConversationId;
exports.getCollectionName = () => CONVERSATIONS_COLLECTION;

exports.initiateConversation = async ({
  memberId,
  memberName,
  initiatedBy = "member",
  initialMessage,
  adminMemberId = null,
}) => {
  const conversationId = buildConversationId(memberId);
  const existing = conversations.get(conversationId);

  const welcome =
    initialMessage ||
    "Hello — I'm James, your Toybox concierge. How can I help you today?";

  if (!existing) {
    const createdAt = nowIso();
    conversations.set(conversationId, {
      memberId: Number(memberId),
      memberName: memberName || null,
      status: "active",
      initiatedBy,
      initiatedByAdminId: adminMemberId,
      conciergeName: CONCIERGE_NAME,
      createdAt,
      lastMessage: welcome,
      lastMessageAt: createdAt,
      unreadForMember: initiatedBy === "admin" ? 1 : 0,
      unreadForAdmin: initiatedBy === "member" ? 1 : 0,
    });

    appendMessage(conversationId, {
      senderId:
        initiatedBy === "admin" ? String(adminMemberId || CONCIERGE_SENDER_ID) : CONCIERGE_SENDER_ID,
      senderType: initiatedBy === "admin" ? "admin" : "concierge",
      senderName: initiatedBy === "admin" ? "Concierge" : CONCIERGE_NAME,
      body: welcome,
    });
  } else if (initialMessage) {
    appendMessage(
      conversationId,
      {
        senderId:
          initiatedBy === "admin" ? String(adminMemberId || CONCIERGE_SENDER_ID) : CONCIERGE_SENDER_ID,
        senderType: initiatedBy === "admin" ? "admin" : "concierge",
        senderName: initiatedBy === "admin" ? "Concierge" : CONCIERGE_NAME,
        body: welcome,
      },
      { unreadForMember: 1 },
    );
  }

  return {
    created: !existing,
    conversation: mapConversationRecord(conversationId, conversations.get(conversationId)),
  };
};

exports.getConversation = async (memberId) => {
  const conversationId = buildConversationId(memberId);
  const data = conversations.get(conversationId);
  if (!data) return null;
  return mapConversationRecord(conversationId, data);
};

exports.listMessages = async (memberId, limit = 50) => {
  const conversationId = buildConversationId(memberId);
  const conv = conversations.get(conversationId);
  if (!conv) {
    return { conversationId, messages: [] };
  }

  const all = getMessages(conversationId);
  const capped = all.slice(-Math.min(limit, 100));

  return {
    conversationId,
    conversation: mapConversationRecord(conversationId, conv),
    messages: capped,
  };
};

exports.sendMessage = async ({ memberId, body, senderType, senderId, senderName }) => {
  const conversationId = buildConversationId(memberId);
  const conv = conversations.get(conversationId);

  if (!conv) {
    throw new AppError("Chat not initiated. Call initiate first.", 404);
  }

  const counters =
    senderType === "member" ? { unreadForAdmin: 1 } : { unreadForMember: 1 };

  const message = appendMessage(
    conversationId,
    { senderId: String(senderId), senderType, senderName, body },
    counters,
  );

  return {
    conversationId,
    message,
    conversation: mapConversationRecord(conversationId, conversations.get(conversationId)),
  };
};

exports.markReadForMember = async (memberId) => {
  const conversationId = buildConversationId(memberId);
  const conv = conversations.get(conversationId);
  if (!conv) return { memberId, markedRead: false };
  conversations.set(conversationId, { ...conv, unreadForMember: 0 });
  return { memberId, markedRead: true };
};

exports.markReadForAdmin = async (memberId) => {
  const conversationId = buildConversationId(memberId);
  const conv = conversations.get(conversationId);
  if (!conv) return { memberId, markedRead: false };
  conversations.set(conversationId, { ...conv, unreadForAdmin: 0 });
  return { memberId, markedRead: true };
};

exports.listConversations = async ({ limit = 50, status = "active" } = {}) => {
  let items = [...conversations.entries()].map(([id, data]) =>
    mapConversationRecord(id, data),
  );

  items.sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));

  if (status) {
    items = items.filter((c) => c.status === status);
  }

  items = items.slice(0, Math.min(limit, 100));

  return {
    conversations: items,
    total: items.length,
  };
};
