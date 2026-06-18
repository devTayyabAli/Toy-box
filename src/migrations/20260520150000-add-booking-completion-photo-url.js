"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Bookings");
    if (!table.completionPhotoUrl) {
      await queryInterface.addColumn("Bookings", "completionPhotoUrl", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Bookings");
    if (table.completionPhotoUrl) {
      await queryInterface.removeColumn("Bookings", "completionPhotoUrl");
    }
  },
};
