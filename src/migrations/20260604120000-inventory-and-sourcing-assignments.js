"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Vehicles", "ownershipType", {
      type: Sequelize.ENUM("inventory", "member"),
      allowNull: false,
      defaultValue: "member",
    });

    await queryInterface.sequelize.query(`
      UPDATE "Vehicles"
      SET "ownershipType" = 'inventory'
      WHERE "memberId" IS NULL
    `);

    await queryInterface.createTable("SourcingVehicleAssignments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sourcingRequestId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "SourcingRequests", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Vehicles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM(
          "pending_member_approval",
          "approved",
          "rejected",
          "withdrawn",
        ),
        allowNull: false,
        defaultValue: "pending_member_approval",
      },
      assignedByMemberId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Members", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assignedAt: { type: Sequelize.DATE, allowNull: false },
      memberDecidedAt: { type: Sequelize.DATE, allowNull: true },
      rejectionReason: { type: Sequelize.TEXT, allowNull: true },
      adminNotes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("SourcingVehicleAssignments", ["sourcingRequestId"], {
      name: "sva_sourcing_request_idx",
    });
    await queryInterface.addIndex("SourcingVehicleAssignments", ["vehicleId"], {
      name: "sva_vehicle_idx",
    });
    await queryInterface.addIndex(
      "SourcingVehicleAssignments",
      ["sourcingRequestId", "status"],
      { name: "sva_request_status_idx" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("SourcingVehicleAssignments");
    await queryInterface.removeColumn("Vehicles", "ownershipType");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Vehicles_ownershipType";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SourcingVehicleAssignments_status";',
    );
  },
};
