"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SourcingRequest extends Model {
    static associate(models) {
      SourcingRequest.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
      SourcingRequest.hasMany(models.SourcingVehicleAssignment, {
        foreignKey: "sourcingRequestId",
        as: "vehicleAssignments",
      });
    }
  }

  SourcingRequest.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      referenceNumber: { type: DataTypes.STRING, unique: true },
      status: { type: DataTypes.STRING, defaultValue: "Request received" },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      make: { type: DataTypes.STRING, allowNull: false },
      model: { type: DataTypes.STRING, allowNull: false },
      yearMin: DataTypes.INTEGER,
      yearMax: DataTypes.INTEGER,
      colour: DataTypes.STRING,
      trim: DataTypes.STRING,
      specifications: { type: DataTypes.JSONB, defaultValue: {} },
      budgetMin: DataTypes.INTEGER,
      budgetMax: DataTypes.INTEGER,
      currency: { type: DataTypes.STRING, defaultValue: "AED" },
      timelineNotes: DataTypes.STRING,
      notes: DataTypes.TEXT,
      timeline: { type: DataTypes.JSONB, defaultValue: [] },
      matches: { type: DataTypes.JSONB, defaultValue: [] },
      completedAt: DataTypes.DATE,
    },
    { sequelize, modelName: "SourcingRequest" },
  );

  return SourcingRequest;
};
