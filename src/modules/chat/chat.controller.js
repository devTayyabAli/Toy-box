"use strict";

const asyncHandler = require("../../middlewares/asyncHandler");
const Response = require("../../helpers/response.helper");
const chatService = require("./chat.service");

exports.initiate = asyncHandler(async (req, res) => {
  const data = await chatService.initiateForMember(req.user.id, req.body);
  return Response.success(res, "Chat initiated", data, data.created ? 201 : 200);
});

exports.getConversation = asyncHandler(async (req, res) => {
  const data = await chatService.getMyConversation(req.user.id);
  return Response.success(res, "Conversation", data);
});

exports.listMessages = asyncHandler(async (req, res) => {
  const data = await chatService.listMyMessages(req.user.id, req.query);
  return Response.success(res, "Messages", data);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const data = await chatService.sendAsMember(req.user.id, req.body.body);
  return Response.success(res, "Message sent", data, 201);
});

exports.markRead = asyncHandler(async (req, res) => {
  const data = await chatService.markReadAsMember(req.user.id);
  return Response.success(res, "Marked read", data);
});

exports.adminInitiate = asyncHandler(async (req, res) => {
  const data = await chatService.initiateForAdmin(req.user.id, req.body);
  return Response.success(res, "Chat initiated for member", data, data.created ? 201 : 200);
});

exports.adminListConversations = asyncHandler(async (req, res) => {
  const data = await chatService.listConversations(req.query);
  return Response.success(res, "Conversations", data);
});

exports.adminGetConversation = asyncHandler(async (req, res) => {
  const data = await chatService.getConversationForAdmin(req.params.memberId, req.query);
  return Response.success(res, "Conversation", data);
});

exports.adminSendMessage = asyncHandler(async (req, res) => {
  const data = await chatService.sendAsAdmin(
    req.user.id,
    req.params.memberId,
    req.body.body,
  );
  return Response.success(res, "Message sent", data, 201);
});

exports.adminMarkRead = asyncHandler(async (req, res) => {
  const data = await chatService.markReadAsAdmin(req.params.memberId);
  return Response.success(res, "Marked read", data);
});
