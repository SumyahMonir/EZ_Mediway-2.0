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

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
        values: ["Male", "Female", "Other"],
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

    isVerified: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Doctor", doctorSchema);