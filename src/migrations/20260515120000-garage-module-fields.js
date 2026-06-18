"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Vehicles", "memberId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Members", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("Vehicles", "isPriority", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Vehicles", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "lastServicedAt", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("Vehicles", "ownerName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Requests", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Requests", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Requests", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Requests", "scheduledAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("Vehicles", ["memberId"]);
    await queryInterface.addIndex("Vehicles", ["isPriority"]);
    await queryInterface.addIndex("Requests", ["type"]);
    await queryInterface.addIndex("Requests", ["vehicleId", "status"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Requests", ["vehicleId", "status"]);
    await queryInterface.removeIndex("Requests", ["type"]);
    await queryInterface.removeIndex("Vehicles", ["isPriority"]);
    await queryInterface.removeIndex("Vehicles", ["memberId"]);

    const requestColumns = ["type", "title", "notes", "scheduledAt"];
    for (const column of requestColumns) {
      await queryInterface.removeColumn("Requests", column);
    }

    const vehicleColumns = ["memberId", "isPriority", "imageUrl", "lastServicedAt", "ownerName"];
    for (const column of vehicleColumns) {
      await queryInterface.removeColumn("Vehicles", column);
    }
  },
};
