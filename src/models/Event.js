"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.hasMany(models.EventRsvp, { foreignKey: "eventId", as: "rsvps" });
    }
  }
  Event.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      startsAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isAllDay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      imageUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      accessType: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      sequelize,
      modelName: "Event",
    },
  );
  return Event;
};
