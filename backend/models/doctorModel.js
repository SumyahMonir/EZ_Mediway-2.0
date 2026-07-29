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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    nid: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    professionalTitle: {
      type: String,
      required: true,
      // Example: "Consultant Cardiologist"
    },

    specialization: {
      type: String,
      required: true,
      // Example: "Cardiology"
    },

    qualifications: {
      type: [String],
      required: true,
      // Example: ["MBBS", "FCPS (Medicine)", "MD (Cardiology)"]
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
      // Years
    },

    hospital: {
      type: String,
      required: true,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    gender: {
      type: String,
      required: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be Male, Female, or Other.",
      },
    },


    languages: {
      type: [String],
      default: ["Bangla"],
    },

    totalPatients: {
      type: Number,
      default: 0,
    },

    // add to doctorSchema, near isVerified
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving — prefixed with "dr" for doctors
doctorSchema.pre("save", async function () { // next likha chilo bract e remove korsi
  if (!this.isModified("name") && this.slug) {
    return next();
  }

  const baseName = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const baseSlug = `dr-${baseName}`;

  let slug = baseSlug;
  let counter = 1;

  const DoctorModel = this.constructor;
  while (await DoctorModel.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  // next();
});

module.exports = mongoose.model("Doctor", doctorSchema);