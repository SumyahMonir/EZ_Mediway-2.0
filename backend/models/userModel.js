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

    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    nid: {
      type: String,
      required: true,
    },

    phone: {
      type: Number,
      required: true,
    },

    weight: {
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

    bloodGroup: {
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