"use strict";

const { PushDeviceToken } = require("../../models");

exports.findActiveByMember = (memberId) =>
  PushDeviceToken.findAll({
    where: { memberId, isActive: true },
    order: [["updatedAt", "DESC"]],
  });

exports.findByToken = (token) => PushDeviceToken.findOne({ where: { token } });

exports.upsertDevice = async (memberId, { token, platform, deviceId, appVersion }) => {
  const existing = await exports.findByToken(token);
  const now = new Date();

  if (existing) {
    await existing.update({
      memberId,
      platform,
      deviceId: deviceId ?? existing.deviceId,
      appVersion: appVersion ?? existing.appVersion,
      isActive: true,
      lastUsedAt: now,
    });
    return existing.reload();
  }

  return PushDeviceToken.create({
    memberId,
    token,
    platform,
    deviceId,
    appVersion,
    isActive: true,
    lastUsedAt: now,
  });
};

exports.deactivate = (token, memberId) =>
  PushDeviceToken.update(
    { isActive: false },
    { where: { token, memberId } },
  );

exports.deactivateByIds = (ids) =>
  PushDeviceToken.update({ isActive: false }, { where: { id: ids } });
