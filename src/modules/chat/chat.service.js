"use strict";

const AppError = require("../../utils/AppError");
const { Member } = require("../../models");
const firebaseChatService = require("../../services/firebaseChat.service");
const { notifyMember } = require("../notifications/notifications.dispatch");

async function loadMember(memberId) {
  const member = await Member.findByPk(memberId);
  if (!member) throw new AppError("Member not found", 404);
  const plain = member.get ? member.get({ plain: true }) : member;
  return {
    id: plain.id,
    name:
      [plain.firstName, plain.lastName].filter(Boolean).join(" ") ||
      plain.name ||
      plain.displayHandle ||
      "Member",
  };
}

function memberDisplayName(member) {
  return member.name;
}

async function pushChatNotification(memberId, title, body, data) {
  notifyMember(memberId, {
    type: "messages",
    title,
    body,
    data: { ...data, screen: "chat" },
    persistInbox: true,
  }).catch(() => {});
}

exports.initiateForMember = async (memberId, { initialMessage } = {}) => {
  const member = await loadMember(memberId);
  const result = await firebaseChatService.initiateConversation({
    memberId: member.id,
    memberName: memberDisplayName(member),
    initiatedBy: "member",
    initialMessage,
  });

  return result;
};

exports.initiateForAdmin = async (adminMemberId, { memberId, initialMessage } = {}) => {
  const member = await loadMember(memberId);
  const result = await firebaseChatService.initiateConversation({
    memberId: member.id,
    memberName: memberDisplayName(member),
    initiatedBy: "admin",
    adminMemberId,
    initialMessage:
      initialMessage ||
      "Hi — your Toybox concierge team has started a chat with you. How can we help?",
  });

  await pushChatNotification(
    member.id,
    "New message from concierge",
    result.conversation.lastMessage,
    {
      conversationId: result.conversation.conversationId,
      action: "chat_initiated",
    },
  );

  return result;
};

exports.getMyConversation = async (memberId) => {
  await loadMember(memberId);
  let conversation = await firebaseChatService.getConversation(memberId);
  if (!conversation) {
    const initiated = await exports.initiateForMember(memberId);
    conversation = initiated.conversation;
  }
  return conversation;
};

exports.listMyMessages = async (memberId, query = {}) => {
  await loadMember(memberId);
  return firebaseChatService.listMessages(memberId, query.limit);
};

exports.sendAsMember = async (memberId, body) => {
  const member = await loadMember(memberId);
  const result = await firebaseChatService.sendMessage({
    memberId: member.id,
    body,
    senderType: "member",
    senderId: member.id,
    senderName: memberDisplayName(member),
  });

  return result;
};

exports.sendAsAdmin = async (adminMemberId, memberId, body) => {
  const member = await loadMember(memberId);
  const admin = await loadMember(adminMemberId);

  const result = await firebaseChatService.sendMessage({
    memberId: member.id,
    body,
    senderType: "admin",
    senderId: admin.id,
    senderName: admin.name || "Concierge",
  });

  await pushChatNotification(member.id, "New concierge message", body, {
    conversationId: result.conversationId,
    action: "chat_message",
  });

  return result;
};

exports.markReadAsMember = async (memberId) => {
  await loadMember(memberId);
  return firebaseChatService.markReadForMember(memberId);
};

exports.markReadAsAdmin = async (memberId) => {
  return firebaseChatService.markReadForAdmin(memberId);
};

exports.listConversations = async (query) => firebaseChatService.listConversations(query);

exports.getConversationForAdmin = async (memberId, query) => {
  await loadMember(memberId);
  return firebaseChatService.listMessages(memberId, query.limit);
};
