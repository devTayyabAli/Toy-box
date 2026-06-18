"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

const db = {};
db.Member = require("./Member")(sequelize, Sequelize.DataTypes);
db.Vehicle = require("./Vehicle")(sequelize, Sequelize.DataTypes);
db.Request = require("./Request")(sequelize, Sequelize.DataTypes);
db.Booking = require("./Booking")(sequelize, Sequelize.DataTypes);
db.Role = require("./Role")(sequelize, Sequelize.DataTypes);
db.Event = require("./Event")(sequelize, Sequelize.DataTypes);
db.EventRsvp = require("./EventRsvp")(sequelize, Sequelize.DataTypes);
db.MaintenanceRequest = require("./MaintenanceRequest")(sequelize, Sequelize.DataTypes);
db.SourcingRequest = require("./SourcingRequest")(sequelize, Sequelize.DataTypes);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.PaymentMethod = require("./PaymentMethod")(sequelize, Sequelize.DataTypes);
db.PaymentTransaction = require("./PaymentTransaction")(sequelize, Sequelize.DataTypes);
db.Message = require("./Message")(sequelize, Sequelize.DataTypes);
db.TransportRequest = require("./TransportRequest")(sequelize, Sequelize.DataTypes);
db.PushDeviceToken = require("./PushDeviceToken")(sequelize, Sequelize.DataTypes);
db.SourcingVehicleAssignment = require("./SourcingVehicleAssignment")(
  sequelize,
  Sequelize.DataTypes,
);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
