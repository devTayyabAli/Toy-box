"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EventRsvps", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Events",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Members",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: "confirmed",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("EventRsvps", ["eventId"]);
    await queryInterface.addIndex("EventRsvps", ["memberId"]);
    await queryInterface.addConstraint("EventRsvps", {
      fields: ["eventId", "memberId"],
      type: "unique",
      name: "event_rsvps_event_member_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EventRsvps");
  },
};
