"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Events", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      startsAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endsAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isAllDay: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      imageUrl: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      accessType: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: "open",
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

    await queryInterface.addIndex("Events", ["category"]);
    await queryInterface.addIndex("Events", ["startsAt"]);
    await queryInterface.addIndex("Events", ["isFeatured"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Events");
  },
};
