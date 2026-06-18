"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Bookings");
    const add = async (name, spec) => {
      if (!table[name]) {
        await queryInterface.addColumn("Bookings", name, spec);
      }
    };

    await add("timeWindowStart", { type: Sequelize.STRING, allowNull: true });
    await add("timeWindowEnd", { type: Sequelize.STRING, allowNull: true });
    await add("serviceLocationKey", { type: Sequelize.STRING, allowNull: true });
    await add("serviceLocation", { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Bookings");
    for (const column of [
      "timeWindowStart",
      "timeWindowEnd",
      "serviceLocationKey",
      "serviceLocation",
    ]) {
      if (table[column]) {
        await queryInterface.removeColumn("Bookings", column);
      }
    }
  },
};
