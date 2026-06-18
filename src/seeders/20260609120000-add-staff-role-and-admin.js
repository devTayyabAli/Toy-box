"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Roles"`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const roleByName = Object.fromEntries(roles.map((r) => [r.name, r.id]));

    if (!roleByName.staff) {
      await queryInterface.bulkInsert("Roles", [
        { name: "staff", createdAt: now, updatedAt: now },
      ]);
      const refreshed = await queryInterface.sequelize.query(
        `SELECT id, name FROM "Roles" WHERE name = 'staff'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      roleByName.staff = refreshed[0]?.id;
    }

    const adminRoleId = roleByName.admin;
    if (!adminRoleId) {
      throw new Error("admin role missing — run add-roles seeder first");
    }

    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM "Members" WHERE email = 'admin@gmail.com' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash("12345678", 12);
      await queryInterface.bulkInsert("Members", [
        {
          email: "admin@gmail.com",
          password: passwordHash,
          firstName: "Admin",
          lastName: "User",
          name: "Admin User",
          roleId: adminRoleId,
          twoFactorEnabled: false,
          mustChangePassword: false,
          membershipTier: null,
          mobileCountryCode: "+971",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Members", { email: "admin@gmail.com" }, {});
    await queryInterface.bulkDelete("Roles", { name: "staff" }, {});
  },
};
