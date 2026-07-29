const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    consultationFee: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      enum: TIME_SLOTS,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "not_available", "completed","Cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    bkashPaymentID: {
      type: String,
      default: "",
  },

    transactionId: {
      type: String,
      default: "",
    },

    doctorMessage: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }

  

);

appointmentSchema.statics.TIME_SLOTS = TIME_SLOTS;

// module.exports = mongoose.model("Appointment", appointmentSchema);
module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);