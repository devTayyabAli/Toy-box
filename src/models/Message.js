"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
    }
  }
  Message.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      senderType: { type: DataTypes.STRING, allowNull: false },
      senderName: DataTypes.STRING,
      body: { type: DataTypes.TEXT, allowNull: false },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      readAt: DataTypes.DATE,
    },
    { sequelize, modelName: "Message" },
  );
  return Message;
};
