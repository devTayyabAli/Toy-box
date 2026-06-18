"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Bookings");
    const add = async (name, spec) => {
      if (!table[name]) {
        await queryInterface.addColumn("Bookings", name, spec);
      }
    };

    await add("serviceType", { type: Sequelize.STRING, allowNull: true });
    await add("referenceNumber", { type: Sequelize.STRING, allowNull: true, unique: true });
    await add("packageKey", { type: Sequelize.STRING, allowNull: true });
    await add("addons", { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });
    await add("specialInstructions", { type: Sequelize.TEXT, allowNull: true });
    await add("scheduledDate", { type: Sequelize.DATEONLY, allowNull: true });
    await add("totalEstimate", { type: Sequelize.INTEGER, allowNull: true });
    await add("currency", { type: Sequelize.STRING, allowNull: false, defaultValue: "AED" });
    await add("timeline", { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });
    await add("assignedStaff", { type: Sequelize.JSONB, allowNull: true });
    await add("workCompleted", { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });
    await add("durationMinutes", { type: Sequelize.INTEGER, allowNull: true });
    await add("bayLocation", { type: Sequelize.STRING, allowNull: true });
    await add("completedAt", { type: Sequelize.DATE, allowNull: true });
    await add("estimatedMinutesRemaining", { type: Sequelize.INTEGER, allowNull: true });
    await add("completionPhotoUrl", { type: Sequelize.STRING, allowNull: true });

    await queryInterface.changeColumn("Bookings", "status", {
      type: Sequelize.STRING,
      defaultValue: "Awaiting confirmation",
    });
  },

  async down(queryInterface, Sequelize) {
    const columns = [
      "serviceType",
      "referenceNumber",
      "packageKey",
      "addons",
      "specialInstructions",
      "scheduledDate",
      "totalEstimate",
      "currency",
      "timeline",
      "assignedStaff",
      "workCompleted",
      "durationMinutes",
      "bayLocation",
      "completedAt",
      "estimatedMinutesRemaining",
      "completionPhotoUrl",
    ];
    for (const column of columns) {
      await queryInterface.removeColumn("Bookings", column);
    }
    await queryInterface.changeColumn("Bookings", "status", {
      type: Sequelize.STRING,
      defaultValue: "Confirmed",
    });
  },
};
