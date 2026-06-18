"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      Member.hasMany(models.Request, { foreignKey: "memberId", as: "requests" });
      Member.hasMany(models.Vehicle, { foreignKey: "memberId", as: "vehicles" });
      Member.hasMany(models.MaintenanceRequest, {
        foreignKey: "memberId",
        as: "maintenanceRequests",
      });
      Member.hasMany(models.SourcingRequest, {
        foreignKey: "memberId",
        as: "sourcingRequests",
      });
      Member.hasMany(models.Booking, { foreignKey: "memberId", as: "bookings" });
      Member.hasMany(models.Notification, { foreignKey: "memberId", as: "notifications" });
      Member.hasMany(models.PaymentMethod, { foreignKey: "memberId", as: "paymentMethods" });
      Member.hasMany(models.Message, { foreignKey: "memberId", as: "messages" });
      Member.hasMany(models.TransportRequest, {
        foreignKey: "memberId",
        as: "transportRequests",
      });
      Member.hasMany(models.PaymentTransaction, {
        foreignKey: "memberId",
        as: "paymentTransactions",
      });
      Member.hasMany(models.EventRsvp, { foreignKey: "memberId", as: "eventRsvps" });
      Member.hasMany(models.PushDeviceToken, {
        foreignKey: "memberId",
        as: "pushDeviceTokens",
      });
      Member.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
    }

    toPublicJSON() {
      const v = this.get({ plain: true });
      delete v.password;
      delete v.otpCodeHash;
      delete v.otpExpiresAt;
      delete v.otpPurpose;
      if (v.displayHandle && !String(v.displayHandle).startsWith("@")) {
        v.displayHandle = `@${v.displayHandle}`;
      }
      if (v.memberNumber) {
        v.memberNumberLabel = `No. ${v.memberNumber}`;
      }
      v.profileImage = v.profileImageUrl ?? null;
      v.coverImage = v.coverImageUrl ?? null;
      v.address = v.residence ?? null;
      v.phone = v.mobile ?? null;
      v.idNumber = v.memberNumber ?? null;
      if (v.memberNumber) {
        v.idNumberLabel = `ID NO. ${v.memberNumber}`;
      }
      v.accountStatus = v.mustChangePassword ? "pending_activation" : "active";
      v.username = v.email;
      return v;
    }
  }
  Member.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      displayHandle: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      memberNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residence: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profileImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otpCodeHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otpPurpose: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notificationSettings: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      membershipTier: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "principal",
      },
      mobileCountryCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "+971",
      },
      privacySettings: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      nextBillingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      mustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      invitedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invitationAcceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      membershipValidityMonths: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Member",
      defaultScope: {
        attributes: {
          exclude: ["password", "otpCodeHash", "otpExpiresAt", "otpPurpose"],
        },
      },
    },
  );
  return Member;
};
