"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    static associate(models) {
      PaymentTransaction.belongsTo(models.Member, {
        foreignKey: "memberId",
        as: "member",
      });
    }
  }

  PaymentTransaction.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      stripeSessionId: { type: DataTypes.STRING, unique: true },
      stripePaymentIntentId: { type: DataTypes.STRING },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING, defaultValue: "AED" },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
      purpose: { type: DataTypes.STRING, allowNull: false },
      referenceType: DataTypes.STRING,
      referenceId: DataTypes.INTEGER,
      metadata: { type: DataTypes.JSONB, defaultValue: {} },
    },
    { sequelize, modelName: "PaymentTransaction" },
  );

  return PaymentTransaction;
};
