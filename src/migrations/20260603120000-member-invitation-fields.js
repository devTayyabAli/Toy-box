"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "mustChangePassword", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Members", "invitedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "invitationAcceptedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Members", "mustChangePassword");
    await queryInterface.removeColumn("Members", "invitedAt");
    await queryInterface.removeColumn("Members", "invitationAcceptedAt");
  },
};
