const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    pickupDate: {
      type: Date,
      required: true,
      index: true,
    },

    returnDate: {
      type: Date,
      required: true,
      index: true,
    },

    totalDays: {
      type: Number,
    },

    rentPerDay: {
      type: Number,
    },

    totalAmount: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["booked", "ongoing", "completed", "cancelled"],
      default: "booked",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },

    notes: String,
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({
  vehicle: 1,
  pickupDate: 1,
  returnDate: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);
