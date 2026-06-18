"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TransportRequest extends Model {
    static associate(models) {
      TransportRequest.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
      TransportRequest.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
    }
  }
  TransportRequest.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      referenceNumber: { type: DataTypes.STRING, unique: true },
      status: { type: DataTypes.STRING, defaultValue: "Awaiting confirmation" },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      vehicleId: { type: DataTypes.INTEGER, allowNull: false },
      serviceType: { type: DataTypes.STRING, allowNull: true },
      pickupLocation: { type: DataTypes.STRING, allowNull: false },
      dropoffLocation: { type: DataTypes.STRING, allowNull: false },
      deliveryAddress: { type: DataTypes.STRING, allowNull: true },
      scheduledDate: { type: DataTypes.DATEONLY, allowNull: true },
      timeWindowStart: { type: DataTypes.STRING, allowNull: true },
      timeWindowEnd: { type: DataTypes.STRING, allowNull: true },
      scheduledAt: { type: DataTypes.DATE, allowNull: false },
      notes: DataTypes.TEXT,
      timeline: { type: DataTypes.JSONB, defaultValue: [] },
      assignedStaff: DataTypes.JSONB,
      completedAt: DataTypes.DATE,
    },
    { sequelize, modelName: "TransportRequest" },
  );
  return TransportRequest;
};
