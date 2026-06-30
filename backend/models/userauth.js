const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userAuthSchema = new Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
    },

    Password: {
      type: String,
      required: true,
    },

    Role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
  },
  { timestamps: true }
);

userAuthSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();
  this.Password = await bcrypt.hash(this.Password, 10);
  next();
});

module.exports = mongoose.model("UserAuth", userAuthSchema);