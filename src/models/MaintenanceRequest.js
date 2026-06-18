"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MaintenanceRequest extends Model {
    static associate(models) {
      MaintenanceRequest.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
      MaintenanceRequest.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
    }
  }

  MaintenanceRequest.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      referenceNumber: { type: DataTypes.STRING, unique: true },
      status: { type: DataTypes.STRING, defaultValue: "Request sent" },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      vehicleId: { type: DataTypes.INTEGER, allowNull: false },
      serviceKeys: { type: DataTypes.JSONB, defaultValue: [] },
      scheduledAt: { type: DataTypes.DATE, allowNull: false },
      locationKey: DataTypes.STRING,
      notes: DataTypes.TEXT,
      documentUrls: { type: DataTypes.JSONB, defaultValue: [] },
      timeline: { type: DataTypes.JSONB, defaultValue: [] },
      lineItems: { type: DataTypes.JSONB, defaultValue: [] },
      totalAmount: DataTypes.INTEGER,
      currency: { type: DataTypes.STRING, defaultValue: "AED" },
      assignedStaff: DataTypes.JSONB,
      workCompleted: { type: DataTypes.JSONB, defaultValue: [] },
      approvedAt: DataTypes.DATE,
      paidAt: DataTypes.DATE,
      completedAt: DataTypes.DATE,
    },
    { sequelize, modelName: "MaintenanceRequest" },
  );

  return MaintenanceRequest;
};
