"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PushDeviceToken extends Model {
    static associate(models) {
      PushDeviceToken.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
    }
  }

  PushDeviceToken.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
      platform: {
        type: DataTypes.ENUM("ios", "android", "web"),
        allowNull: false,
        defaultValue: "android",
      },
      deviceId: { type: DataTypes.STRING, allowNull: true },
      appVersion: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      lastUsedAt: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, modelName: "PushDeviceToken", tableName: "PushDeviceTokens" },
  );

  return PushDeviceToken;
};
