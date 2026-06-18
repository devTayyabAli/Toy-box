const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    rentPerDay: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
      index: true,
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric"],
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"],
    },

    seatingCapacity: Number,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

vehicleSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
