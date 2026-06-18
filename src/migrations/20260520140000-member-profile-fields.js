"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "jobTitle", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "membershipTier", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "principal",
    });
    await queryInterface.addColumn("Members", "mobileCountryCode", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "+971",
    });
    await queryInterface.addColumn("Members", "privacySettings", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("Members", "nextBillingDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Members", "nextBillingDate");
    await queryInterface.removeColumn("Members", "privacySettings");
    await queryInterface.removeColumn("Members", "mobileCountryCode");
    await queryInterface.removeColumn("Members", "membershipTier");
    await queryInterface.removeColumn("Members", "jobTitle");
  },
};
