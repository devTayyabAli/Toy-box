"use strict";

const AppError = require("../../utils/AppError");
const firebaseService = require("../../services/firebase.service");
const pushDevicesRepository = require("./pushDevices.repository");

exports.registerDevice = async (memberId, body) => {
  if (!firebaseService.isClientConfigured()) {
    throw new AppError("Firebase client is not configured on the server", 503);
  }

  const row = await pushDevicesRepository.upsertDevice(memberId, body);
  return {
    id: row.id,
    platform: row.platform,
    deviceId: row.deviceId,
    isActive: row.isActive,
    lastUsedAt: row.lastUsedAt,
    pushReady: firebaseService.isAdminEnabled(),
  };
};

exports.unregisterDevice = async (memberId, token) => {
  const [count] = await pushDevicesRepository.deactivate(token, memberId);
  if (!count) {
    throw new AppError("Device token not found", 404);
  }
  return { removed: true };
};

exports.listDevices = async (memberId) => {
  const rows = await pushDevicesRepository.findActiveByMember(memberId);
  return rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    deviceId: r.deviceId,
    appVersion: r.appVersion,
    lastUsedAt: r.lastUsedAt,
    createdAt: r.createdAt,
  }));
};
