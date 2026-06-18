const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "admin",
    },

    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
