"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "twoFactorEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Members", "otpCodeHash", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "otpExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "otpPurpose", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Members", "otpPurpose");
    await queryInterface.removeColumn("Members", "otpExpiresAt");
    await queryInterface.removeColumn("Members", "otpCodeHash");
    await queryInterface.removeColumn("Members", "twoFactorEnabled");
  },
};
