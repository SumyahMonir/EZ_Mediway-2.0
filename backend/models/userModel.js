const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    UserAuthId: {
      type: Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
      unique: true,
    },

    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },

    NID: {
      type: String,
      required: true,
    },

    Phone: {
      type: Number,
      required: true,
    },

    Weight: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other.",
      },
    },

    Blood_Grp: {
      type: String,
      required: true,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "Invalid blood group.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);