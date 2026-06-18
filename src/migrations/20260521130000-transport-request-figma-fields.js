"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("TransportRequests");
    const add = async (name, spec) => {
      if (!table[name]) {
        await queryInterface.addColumn("TransportRequests", name, spec);
      }
    };

    await add("serviceType", { type: Sequelize.STRING, allowNull: true });
    await add("scheduledDate", { type: Sequelize.DATEONLY, allowNull: true });
    await add("timeWindowStart", { type: Sequelize.STRING, allowNull: true });
    await add("timeWindowEnd", { type: Sequelize.STRING, allowNull: true });
    await add("deliveryAddress", { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("TransportRequests");
    for (const column of [
      "serviceType",
      "scheduledDate",
      "timeWindowStart",
      "timeWindowEnd",
      "deliveryAddress",
    ]) {
      if (table[column]) {
        await queryInterface.removeColumn("TransportRequests", column);
      }
    }
  },
};
