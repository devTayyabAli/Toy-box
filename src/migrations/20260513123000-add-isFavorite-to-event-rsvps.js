"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("EventRsvps", "isFavorite", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addIndex("EventRsvps", ["memberId", "isFavorite"], {
      name: "event_rsvps_member_favorite_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("EventRsvps", "event_rsvps_member_favorite_idx");
    await queryInterface.removeColumn("EventRsvps", "isFavorite");
  },
};
