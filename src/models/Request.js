"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    static associate(models) {
      Request.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
      Request.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
    }
  }
  Request.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Requested",
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      notes: DataTypes.TEXT,
      scheduledAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Request",
    },
  );
  return Request;
};
