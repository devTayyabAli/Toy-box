"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "stripeCustomerId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("PaymentMethods", "stripePaymentMethodId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.createTable("PaymentTransactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      stripeSessionId: { type: Sequelize.STRING, unique: true },
      stripePaymentIntentId: { type: Sequelize.STRING },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING, defaultValue: "AED" },
      status: { type: Sequelize.STRING, defaultValue: "pending" },
      purpose: { type: Sequelize.STRING, allowNull: false },
      referenceType: { type: Sequelize.STRING },
      referenceId: { type: Sequelize.INTEGER },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("PaymentTransactions", ["memberId"]);
    await queryInterface.addIndex("PaymentTransactions", ["stripeSessionId"]);
    await queryInterface.addIndex("PaymentTransactions", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PaymentTransactions");
    await queryInterface.removeColumn("PaymentMethods", "stripePaymentMethodId");
    await queryInterface.removeColumn("Members", "stripeCustomerId");
  },
};
