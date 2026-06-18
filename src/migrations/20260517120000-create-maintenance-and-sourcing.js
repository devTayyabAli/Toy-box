"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MaintenanceRequests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      referenceNumber: { type: Sequelize.STRING, unique: true },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Request sent",
      },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Vehicles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serviceKeys: { type: Sequelize.JSONB, defaultValue: [] },
      scheduledAt: { type: Sequelize.DATE, allowNull: false },
      locationKey: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      documentUrls: { type: Sequelize.JSONB, defaultValue: [] },
      timeline: { type: Sequelize.JSONB, defaultValue: [] },
      lineItems: { type: Sequelize.JSONB, defaultValue: [] },
      totalAmount: { type: Sequelize.INTEGER },
      currency: { type: Sequelize.STRING, defaultValue: "AED" },
      assignedStaff: { type: Sequelize.JSONB },
      workCompleted: { type: Sequelize.JSONB, defaultValue: [] },
      approvedAt: { type: Sequelize.DATE },
      paidAt: { type: Sequelize.DATE },
      completedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("SourcingRequests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      referenceNumber: { type: Sequelize.STRING, unique: true },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Request received",
      },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      make: { type: Sequelize.STRING, allowNull: false },
      model: { type: Sequelize.STRING, allowNull: false },
      yearMin: { type: Sequelize.INTEGER },
      yearMax: { type: Sequelize.INTEGER },
      colour: { type: Sequelize.STRING },
      trim: { type: Sequelize.STRING },
      specifications: { type: Sequelize.JSONB, defaultValue: {} },
      budgetMin: { type: Sequelize.INTEGER },
      budgetMax: { type: Sequelize.INTEGER },
      currency: { type: Sequelize.STRING, defaultValue: "AED" },
      timelineNotes: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      timeline: { type: Sequelize.JSONB, defaultValue: [] },
      matches: { type: Sequelize.JSONB, defaultValue: [] },
      completedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("MaintenanceRequests", ["memberId"]);
    await queryInterface.addIndex("MaintenanceRequests", ["vehicleId"]);
    await queryInterface.addIndex("MaintenanceRequests", ["status"]);
    await queryInterface.addIndex("SourcingRequests", ["memberId"]);
    await queryInterface.addIndex("SourcingRequests", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("SourcingRequests");
    await queryInterface.dropTable("MaintenanceRequests");
  },
};
