"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EventRsvp extends Model {
    static associate(models) {
      EventRsvp.belongsTo(models.Event, { foreignKey: "eventId", as: "event" });
      EventRsvp.belongsTo(models.Member, { foreignKey: "memberId", as: "member" });
    }
  }
  EventRsvp.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "confirmed",
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "EventRsvp",
    },
  );
  return EventRsvp;
};
