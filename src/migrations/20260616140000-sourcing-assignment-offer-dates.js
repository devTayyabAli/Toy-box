"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("SourcingVehicleAssignments", "offerStartDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("SourcingVehicleAssignments", "offerEndDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("SourcingVehicleAssignments", "offerEndDate");
    await queryInterface.removeColumn("SourcingVehicleAssignments", "offerStartDate");
  },
};
