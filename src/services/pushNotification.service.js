"use strict";

const firebaseService = require("./firebase.service");

const PLATFORMS = ["ios", "android", "web"];

function buildApnsPayload({ title, body, badge, sound, category, threadId, data }) {
  const aps = {
    alert: typeof title === "string" && !body ? title : { title, body },
    sound: sound || "default",
  };
  if (badge != null) aps.badge = badge;

  const payload = { aps };
  if (category) payload.aps.category = category;
  if (threadId) payload.aps["thread-id"] = threadId;

  const message = {
    headers: {
      "apns-priority": "10",
      ...(process.env.APNS_BUNDLE_ID
        ? { "apns-topic": process.env.APNS_BUNDLE_ID }
        : {}),
    },
    payload,
  };

  if (data && Object.keys(data).length) {
    message.payload = { ...payload, ...data };
  }

  return message;
}

function buildAndroidPayload({ title, body, channelId, imageUrl, data }) {
  return {
    priority: "high",
    notification: {
      title,
      body,
      channelId: channelId || process.env.FCM_ANDROID_CHANNEL_ID || "default",
      ...(imageUrl ? { imageUrl } : {}),
    },
    ...(data ? { data: stringifyDataValues(data) } : {}),
  };
}

function stringifyDataValues(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value == null ? "" : String(value);
  }
  return out;
}

function buildFcmMessage(token, platform, payload) {
  const { title, body, data, badge, sound, imageUrl, category, threadId, channelId } =
    payload;

  const message = {
    token,
    notification: { title, body },
    data: data ? stringifyDataValues(data) : undefined,
  };

  if (platform === "ios") {
    message.apns = buildApnsPayload({
      title,
      body,
      badge,
      sound,
      category,
      threadId,
      data,
    });
  }

  if (platform === "android") {
    message.android = buildAndroidPayload({
      title,
      body,
      channelId,
      imageUrl,
      data,
    });
  }

  if (platform === "web") {
    message.webpush = {
      notification: { title, body, ...(imageUrl ? { icon: imageUrl } : {}) },
      data: data ? stringifyDataValues(data) : undefined,
    };
  }

  return message;
}

async function sendToToken(token, platform, payload) {
  const messaging = firebaseService.getMessaging();
  if (!messaging) {
    return { success: false, reason: "firebase_not_configured" };
  }

  const normalizedPlatform = PLATFORMS.includes(platform) ? platform : "android";
  const message = buildFcmMessage(token, normalizedPlatform, payload);

  try {
    const messageId = await messaging.send(message);
    return { success: true, messageId };
  } catch (err) {
    const code = err.code || err.errorInfo?.code;
    const invalidToken =
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token";
    return {
      success: false,
      reason: code || err.message,
      invalidToken,
    };
  }
}

async function sendMulticast(tokensByPlatform, payload) {
  const results = [];
  for (const entry of tokensByPlatform) {
    const result = await sendToToken(entry.token, entry.platform, payload);
    results.push({ tokenId: entry.id, token: entry.token, ...result });
  }
  const sent = results.filter((r) => r.success).length;
  const failed = results.length - sent;
  return { sent, failed, results };
}

module.exports = {
  PLATFORMS,
  buildFcmMessage,
  sendToToken,
  sendMulticast,
};
