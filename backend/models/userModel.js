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

    Blood_Grp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);