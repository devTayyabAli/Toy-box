"use strict";
const { Model } = require("sequelize");

const SERVICE_TYPES = ["detailing_wash"];

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
      Booking.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Awaiting confirmation",
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceType: DataTypes.STRING,
      referenceNumber: {
        type: DataTypes.STRING,
        unique: true,
      },
      packageKey: DataTypes.STRING,
      addons: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      specialInstructions: DataTypes.TEXT,
      scheduledDate: DataTypes.DATEONLY,
      timeWindowStart: DataTypes.STRING,
      timeWindowEnd: DataTypes.STRING,
      serviceLocationKey: DataTypes.STRING,
      serviceLocation: DataTypes.STRING,
      totalEstimate: DataTypes.INTEGER,
      currency: {
        type: DataTypes.STRING,
        defaultValue: "AED",
      },
      timeline: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      assignedStaff: DataTypes.JSONB,
      workCompleted: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      durationMinutes: DataTypes.INTEGER,
      bayLocation: DataTypes.STRING,
      completedAt: DataTypes.DATE,
      estimatedMinutesRemaining: DataTypes.INTEGER,
      completionPhotoUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Booking",
    },
  );

  Booking.SERVICE_TYPES = SERVICE_TYPES;

  return Booking;
};
