"use strict";

const AppError = require("../utils/AppError");
const firebaseConfig = require("../config/firebase");
const logger = require("../utils/logger");

let warnedMemoryFallback = false;

function useMemoryFallback() {
  if (firebaseConfig.enabled) return false;
  if (process.env.CHAT_DEV_FALLBACK === "false") return false;
  if (process.env.NODE_ENV === "production" && process.env.CHAT_DEV_FALLBACK !== "true") {
    return false;
  }
  return true;
}

function getProvider() {
  if (firebaseConfig.enabled) {
    return require("./firebaseChat.firestore");
  }

  if (useMemoryFallback()) {
    if (!warnedMemoryFallback) {
      warnedMemoryFallback = true;
      logger.warning(
        "[Chat] Firebase Admin not configured — using in-memory chat store (dev only). " +
          "Add secrets/firebase-service-account.json or set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY for Firestore.",
      );
    }
    return require("./firebaseChat.memory");
  }

  throw new AppError(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env " +
      "(download JSON from Firebase Console → Project settings → Service accounts).",
    503,
  );
}

function delegate(method) {
  return (...args) => getProvider()[method](...args);
}

exports.buildConversationId = (...args) => getProvider().buildConversationId(...args);
exports.getCollectionName = () => getProvider().getCollectionName();
exports.initiateConversation = delegate("initiateConversation");
exports.getConversation = delegate("getConversation");
exports.listMessages = delegate("listMessages");
exports.sendMessage = delegate("sendMessage");
exports.markReadForMember = delegate("markReadForMember");
exports.markReadForAdmin = delegate("markReadForAdmin");
exports.listConversations = delegate("listConversations");
