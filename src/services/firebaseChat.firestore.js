"use strict";

const firebaseConfig = require("../config/firebase");

const CONVERSATIONS_COLLECTION =
  process.env.FIRESTORE_CONVERSATIONS_COLLECTION || "conversations";
const MESSAGES_SUBCOLLECTION =
  process.env.FIRESTORE_MESSAGES_SUBCOLLECTION || "messages";
const CONCIERGE_NAME = process.env.CONCIERGE_NAME || "James T.";
const CONCIERGE_SENDER_ID = "concierge";

function firestore() {
  return firebaseConfig.admin.firestore();
}

function serverTimestamp() {
  return firebaseConfig.admin.firestore.FieldValue.serverTimestamp();
}

function buildConversationId(memberId) {
  return `member_${Number(memberId)}`;
}

function mapTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapMessage(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderType: data.senderType,
    senderName: data.senderName,
    body: data.body,
    createdAt: mapTimestamp(data.createdAt),
  };
}

function mapConversation(doc) {
  const data = doc.data();
  return {
    conversationId: doc.id,
    memberId: data.memberId,
    memberName: data.memberName,
    status: data.status,
    initiatedBy: data.initiatedBy,
    lastMessage: data.lastMessage,
    lastMessageAt: mapTimestamp(data.lastMessageAt),
    unreadForMember: data.unreadForMember ?? 0,
    unreadForAdmin: data.unreadForAdmin ?? 0,
    createdAt: mapTimestamp(data.createdAt),
    storage: "firestore",
    firestorePath: `${CONVERSATIONS_COLLECTION}/${doc.id}`,
    messagesPath: `${CONVERSATIONS_COLLECTION}/${doc.id}/${MESSAGES_SUBCOLLECTION}`,
  };
}

async function addMessage(conversationRef, message, counters = {}) {
  const db = firestore();
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc();

  await db.runTransaction(async (tx) => {
    tx.set(messageRef, {
      conversationId: conversationRef.id,
      senderId: message.senderId,
      senderType: message.senderType,
      senderName: message.senderName,
      body: message.body,
      createdAt: serverTimestamp(),
    });

    const patch = {
      lastMessage: message.body,
      lastMessageAt: serverTimestamp(),
      ...counters,
    };
    tx.set(conversationRef, patch, { merge: true });
  });

  const saved = await messageRef.get();
  return mapMessage(saved);
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
  const db = firestore();
  const conversationId = buildConversationId(memberId);
  const ref = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const existing = await ref.get();

  const welcome =
    initialMessage ||
    "Hello — I'm James, your Toybox concierge. How can I help you today?";

  if (!existing.exists) {
    await ref.set({
      memberId: Number(memberId),
      memberName: memberName || null,
      status: "active",
      initiatedBy,
      initiatedByAdminId: adminMemberId,
      conciergeName: CONCIERGE_NAME,
      createdAt: serverTimestamp(),
      lastMessage: welcome,
      lastMessageAt: serverTimestamp(),
      unreadForMember: initiatedBy === "admin" ? 1 : 0,
      unreadForAdmin: initiatedBy === "member" ? 1 : 0,
    });

    await addMessage(ref, {
      senderId:
        initiatedBy === "admin" ? String(adminMemberId || CONCIERGE_SENDER_ID) : CONCIERGE_SENDER_ID,
      senderType: initiatedBy === "admin" ? "admin" : "concierge",
      senderName: initiatedBy === "admin" ? "Concierge" : CONCIERGE_NAME,
      body: welcome,
    });
  } else if (initialMessage) {
    await addMessage(
      ref,
      {
        senderId:
          initiatedBy === "admin" ? String(adminMemberId || CONCIERGE_SENDER_ID) : CONCIERGE_SENDER_ID,
        senderType: initiatedBy === "admin" ? "admin" : "concierge",
        senderName: initiatedBy === "admin" ? "Concierge" : CONCIERGE_NAME,
        body: welcome,
      },
      {
        unreadForMember: firebaseConfig.admin.firestore.FieldValue.increment(1),
      },
    );
  }

  const fresh = await ref.get();
  return {
    created: !existing.exists,
    conversation: mapConversation(fresh),
  };
};

exports.getConversation = async (memberId) => {
  const ref = firestore()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(buildConversationId(memberId));
  const snap = await ref.get();
  if (!snap.exists) return null;
  return mapConversation(snap);
};

exports.listMessages = async (memberId, limit = 50) => {
  const conversationId = buildConversationId(memberId);
  const ref = firestore().collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const conv = await ref.get();
  if (!conv.exists) {
    return { conversationId, messages: [] };
  }

  const snap = await ref
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.min(limit, 100))
    .get();

  return {
    conversationId,
    conversation: mapConversation(conv),
    messages: snap.docs.map(mapMessage).reverse(),
  };
};

exports.sendMessage = async ({ memberId, body, senderType, senderId, senderName }) => {
  const conversationId = buildConversationId(memberId);
  const ref = firestore().collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const conv = await ref.get();

  if (!conv.exists) {
    throw new (require("../utils/AppError"))("Chat not initiated. Call initiate first.", 404);
  }

  const counters =
    senderType === "member"
      ? { unreadForAdmin: firebaseConfig.admin.firestore.FieldValue.increment(1) }
      : { unreadForMember: firebaseConfig.admin.firestore.FieldValue.increment(1) };

  const message = await addMessage(
    ref,
    { senderId: String(senderId), senderType, senderName, body },
    counters,
  );

  return {
    conversationId,
    message,
    conversation: mapConversation(await ref.get()),
  };
};

exports.markReadForMember = async (memberId) => {
  const ref = firestore()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(buildConversationId(memberId));
  const snap = await ref.get();
  if (!snap.exists) return { memberId, markedRead: false };
  await ref.update({ unreadForMember: 0 });
  return { memberId, markedRead: true };
};

exports.markReadForAdmin = async (memberId) => {
  const ref = firestore()
    .collection(CONVERSATIONS_COLLECTION)
    .doc(buildConversationId(memberId));
  const snap = await ref.get();
  if (!snap.exists) return { memberId, markedRead: false };
  await ref.update({ unreadForAdmin: 0 });
  return { memberId, markedRead: true };
};

exports.listConversations = async ({ limit = 50, status = "active" } = {}) => {
  const snap = await firestore()
    .collection(CONVERSATIONS_COLLECTION)
    .orderBy("lastMessageAt", "desc")
    .limit(Math.min(limit, 100))
    .get();

  let conversations = snap.docs.map(mapConversation);
  if (status) {
    conversations = conversations.filter((c) => c.status === status);
  }

  return {
    conversations,
    total: conversations.length,
  };
};
