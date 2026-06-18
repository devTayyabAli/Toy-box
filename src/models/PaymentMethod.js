"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    static associate(models) {
      PaymentMethod.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
    }
  }
  PaymentMethod.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      memberId: { type: DataTypes.INTEGER, allowNull: false },
      label: { type: DataTypes.STRING, allowNull: false },
      brand: DataTypes.STRING,
      last4: DataTypes.STRING(4),
      expiryMonth: DataTypes.INTEGER,
      expiryYear: DataTypes.INTEGER,
      isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
      stripePaymentMethodId: { type: DataTypes.STRING, unique: true },
    },
    { sequelize, modelName: "PaymentMethod" },
  );
  return PaymentMethod;
};
