"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Vehicles", "engine", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "power", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "transmission", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "drive", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "zeroToHundred", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "topSpeed", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "colour", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "chassisNo", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Vehicles", "plate", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "purchasedAt", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "storageBay", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "mileage", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "documents", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
    await queryInterface.addColumn("Vehicles", "health", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn("Vehicles", "registrationStep", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "complete",
    });
  },

  async down(queryInterface) {
    const columns = [
      "engine",
      "power",
      "transmission",
      "drive",
      "zeroToHundred",
      "topSpeed",
      "colour",
      "chassisNo",
      "plate",
      "purchasedAt",
      "storageBay",
      "mileage",
      "documents",
      "health",
      "registrationStep",
    ];
    for (const column of columns) {
      await queryInterface.removeColumn("Vehicles", column);
    }
  },
};
