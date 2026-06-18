"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: { type: Sequelize.STRING, allowNull: false, defaultValue: "general" },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      readAt: { type: Sequelize.DATE },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("PaymentMethods", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      label: { type: Sequelize.STRING, allowNull: false },
      brand: { type: Sequelize.STRING },
      last4: { type: Sequelize.STRING(4) },
      expiryMonth: { type: Sequelize.INTEGER },
      expiryYear: { type: Sequelize.INTEGER },
      isDefault: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("Messages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      senderType: { type: Sequelize.STRING, allowNull: false },
      senderName: { type: Sequelize.STRING },
      body: { type: Sequelize.TEXT, allowNull: false },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      readAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("TransportRequests", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      referenceNumber: { type: Sequelize.STRING, unique: true },
      status: { type: Sequelize.STRING, defaultValue: "Request sent" },
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
      pickupLocation: { type: Sequelize.STRING, allowNull: false },
      dropoffLocation: { type: Sequelize.STRING, allowNull: false },
      scheduledAt: { type: Sequelize.DATE, allowNull: false },
      notes: { type: Sequelize.TEXT },
      timeline: { type: Sequelize.JSONB, defaultValue: [] },
      assignedStaff: { type: Sequelize.JSONB },
      completedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("Notifications", ["memberId", "isRead"]);
    await queryInterface.addIndex("PaymentMethods", ["memberId"]);
    await queryInterface.addIndex("Messages", ["memberId"]);
    await queryInterface.addIndex("TransportRequests", ["memberId"]);
    await queryInterface.addIndex("TransportRequests", ["vehicleId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("TransportRequests");
    await queryInterface.dropTable("Messages");
    await queryInterface.dropTable("PaymentMethods");
    await queryInterface.dropTable("Notifications");
  },
};
