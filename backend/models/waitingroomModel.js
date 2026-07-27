const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const queueEntrySchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "skipped", "disconnected"],
      default: "waiting",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const waitingRoomSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    // Normalized to UTC midnight so it lines up with how Appointment.date is queried
    date: { type: Date, required: true },

    timeSlot: { type: String, required: true },

    status: {
      type: String,
      enum: ["closed", "live", "ended"],
      default: "closed",
    },

    // The doctor pastes their own call link (Jitsi, Meet, Zoom — whatever
    // they created) once they're ready. Patients use this exact link to
    // join when it's their turn. The app doesn't create or control the
    // call itself, only who's allowed to click Join and when.
    callLink: { type: String, default: null },
    callActive: { type: Boolean, default: false },

    currentPatientId: { type: Schema.Types.ObjectId, ref: "Users", default: null },

    // Only patients who have actually connected show up here —
    // this list IS the "waiting room" the doctor and patients see.
    queue: [queueEntrySchema],
  },
  { timestamps: true }
);

// One room document per doctor+date+timeSlot, reused across the day it's opened/closed/reopened.
waitingRoomSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

// Guard against "Cannot overwrite model once compiled" if this file ever
// gets required more than once (nodemon reloads, case-mismatched requires).
module.exports = mongoose.models.WaitingRoom || mongoose.model("WaitingRoom", waitingRoomSchema);