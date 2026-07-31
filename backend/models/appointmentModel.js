const mongoose = require("mongoose");
const Schema = mongoose.Schema;


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
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed","Cancelled"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
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


// module.exports = mongoose.model("Appointment", appointmentSchema);
module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);