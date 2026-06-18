"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SourcingVehicleAssignment extends Model {
    static associate(models) {
      SourcingVehicleAssignment.belongsTo(models.SourcingRequest, {
        foreignKey: "sourcingRequestId",
        as: "sourcingRequest",
      });
      SourcingVehicleAssignment.belongsTo(models.Vehicle, {
        foreignKey: "vehicleId",
        as: "vehicle",
      });
      SourcingVehicleAssignment.belongsTo(models.Member, {
        foreignKey: "assignedByMemberId",
        as: "assignedBy",
      });
    }
  }

  SourcingVehicleAssignment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      sourcingRequestId: { type: DataTypes.INTEGER, allowNull: false },
      vehicleId: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "pending_member_approval",
          "approved",
          "rejected",
          "withdrawn",
        ),
        allowNull: false,
        defaultValue: "pending_member_approval",
      },
      assignedByMemberId: { type: DataTypes.INTEGER, allowNull: true },
      assignedAt: { type: DataTypes.DATE, allowNull: false },
      memberDecidedAt: { type: DataTypes.DATE, allowNull: true },
      rejectionReason: { type: DataTypes.TEXT, allowNull: true },
      adminNotes: { type: DataTypes.TEXT, allowNull: true },
      offerStartDate: { type: DataTypes.DATEONLY, allowNull: true },
      offerEndDate: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { sequelize, modelName: "SourcingVehicleAssignment" },
  );

  return SourcingVehicleAssignment;
};
