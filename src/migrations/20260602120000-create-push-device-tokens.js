"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PushDeviceTokens", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      token: { type: Sequelize.STRING(512), allowNull: false, unique: true },
      platform: {
        type: Sequelize.ENUM("ios", "android", "web"),
        allowNull: false,
        defaultValue: "android",
      },
      deviceId: { type: Sequelize.STRING, allowNull: true },
      appVersion: { type: Sequelize.STRING, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      lastUsedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("PushDeviceTokens", ["memberId", "isActive"], {
      name: "push_device_tokens_member_active",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PushDeviceTokens");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_PushDeviceTokens_platform";',
    );
  },
};
