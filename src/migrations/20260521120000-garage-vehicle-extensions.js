"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Vehicles", "vehicleType", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "car",
    });
    await queryInterface.addColumn("Vehicles", "fuelType", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "fuelLevel", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "interiorColor", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "fuelEfficiency", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "maxTorque", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex("Vehicles", ["vehicleType"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Vehicles", ["vehicleType"]);
    await queryInterface.removeColumn("Vehicles", "maxTorque");
    await queryInterface.removeColumn("Vehicles", "fuelEfficiency");
    await queryInterface.removeColumn("Vehicles", "interiorColor");
    await queryInterface.removeColumn("Vehicles", "fuelLevel");
    await queryInterface.removeColumn("Vehicles", "fuelType");
    await queryInterface.removeColumn("Vehicles", "vehicleType");
  },
};
