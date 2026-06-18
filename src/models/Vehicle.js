"use strict";
const { Model } = require("sequelize");

const HEALTH_CATEGORIES = [
  "engine_drivetrain",
  "engine_performance",
  "transmission",
  "braking_system",
  "suspension",
  "electrical_system",
  "battery_health",
  "tyres",
  "brakes",
  "fluids",
  "battery",
  "exterior_body",
];

const VEHICLE_TYPES = ["car", "bike", "other"];

const DOCUMENT_TYPES = [
  "vehicleRegistration",
  "insuranceCertificate",
  "specsAndInfo",
  "serviceRecord",
  "purchasedInvoice",
  "warrantyCertificate",
];

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      Vehicle.belongsTo(models.Member, { foreignKey: "memberId", as: "owner" });
      Vehicle.hasMany(models.Request, { foreignKey: "vehicleId", as: "requests" });
      Vehicle.hasMany(models.Booking, { foreignKey: "vehicleId", as: "bookings" });
      Vehicle.hasMany(models.MaintenanceRequest, {
        foreignKey: "vehicleId",
        as: "maintenanceRequests",
      });
      Vehicle.hasMany(models.TransportRequest, {
        foreignKey: "vehicleId",
        as: "transportRequests",
      });
      Vehicle.hasMany(models.SourcingVehicleAssignment, {
        foreignKey: "vehicleId",
        as: "sourcingAssignments",
      });
    }
  }

  Vehicle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      make: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Available",
      },
      engine: DataTypes.STRING,
      power: DataTypes.STRING,
      transmission: DataTypes.STRING,
      drive: DataTypes.STRING,
      zeroToHundred: DataTypes.STRING,
      topSpeed: DataTypes.STRING,
      colour: DataTypes.STRING,
      chassisNo: {
        type: DataTypes.STRING,
        unique: true,
      },
      plate: DataTypes.STRING,
      purchasedAt: DataTypes.DATEONLY,
      storageBay: DataTypes.STRING,
      mileage: DataTypes.STRING,
      documents: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      health: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      registrationStep: {
        type: DataTypes.STRING,
        defaultValue: "complete",
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isPriority: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      imageUrl: DataTypes.STRING,
      lastServicedAt: DataTypes.DATEONLY,
      ownerName: DataTypes.STRING,
      vehicleType: {
        type: DataTypes.STRING,
        defaultValue: "car",
      },
      fuelType: DataTypes.STRING,
      fuelLevel: DataTypes.STRING,
      interiorColor: DataTypes.STRING,
      fuelEfficiency: DataTypes.STRING,
      maxTorque: DataTypes.STRING,
      ownershipType: {
        type: DataTypes.ENUM("inventory", "member"),
        allowNull: false,
        defaultValue: "member",
      },
    },
    {
      sequelize,
      modelName: "Vehicle",
    },
  );

  Vehicle.HEALTH_CATEGORIES = HEALTH_CATEGORIES;
  Vehicle.DOCUMENT_TYPES = DOCUMENT_TYPES;
  Vehicle.VEHICLE_TYPES = VEHICLE_TYPES;

  return Vehicle;
};
