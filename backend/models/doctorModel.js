const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const doctorSchema = new Schema(
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

    Fee: {
      type: Number,
      required: true,
    },

    License_no: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);