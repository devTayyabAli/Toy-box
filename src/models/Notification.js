"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
    }
  }
  Notification.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.STRING, defaultValue: "general" },
      title: { type: DataTypes.STRING, allowNull: false },
      body: DataTypes.TEXT,
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      readAt: DataTypes.DATE,
      metadata: { type: DataTypes.JSONB, defaultValue: {} },
    },
    { sequelize, modelName: "Notification" },
  );
  return Notification;
};
