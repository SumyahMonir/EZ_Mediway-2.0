const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema(
  {
    medicine: { type: String, required: true, trim: true },
    strength: { type: String, trim: true, default: "" },
    dosage: { type: String, trim: true, default: "" },
    frequency: { type: String, trim: true, default: "" },
    duration: { type: String, trim: true, default: "" },
    instruction: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const testSchema = new Schema(
  { testName: { type: String, required: true, trim: true } },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },

    diagnosis: { type: String, required: true, trim: true },
    medicines: { type: [medicineSchema], default: [] },
    tests: { type: [testSchema], default: [] },
    advice: { type: String, trim: true, default: "" },
    followUp: { type: String, trim: true, default: "" },
    additionalNotes: { type: String, trim: true, default: "" },
    dateIssued: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "completed", "sent"], default: "draft" },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);