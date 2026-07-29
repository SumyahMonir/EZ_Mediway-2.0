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

    slug: {
      type: String,
      unique: true,
      index: true,
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
        values: ["male", "female", "others"],
        message: "Gender must be male, female, or others.",
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

    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving — same pattern as Doctor
userSchema.pre("save", async function () { //ekhane bracket e next likha chilo
  if (!this.isModified("name") && this.slug) {
    return next();
  }

  const baseSlug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  const UserModel = this.constructor;
  while (await UserModel.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  // next();
});

module.exports = mongoose.model("Users", userSchema);