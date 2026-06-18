"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "firstName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "lastName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "displayHandle", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Members", "memberNumber", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Members", "mobile", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "residence", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "profileImageUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Members", "profileImageUrl");
    await queryInterface.removeColumn("Members", "residence");
    await queryInterface.removeColumn("Members", "mobile");
    await queryInterface.removeColumn("Members", "memberNumber");
    await queryInterface.removeColumn("Members", "displayHandle");
    await queryInterface.removeColumn("Members", "lastName");
    await queryInterface.removeColumn("Members", "firstName");
    await queryInterface.removeColumn("Members", "password");
  },
};
