const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const slotSchema = new Schema(
  {
    // Stored as 24hr "HH:MM" (what <input type="time"> gives natively).
    // The frontend formats these to "h:mm AM/PM" when building the actual
    // booking-facing timeSlot string, so this stays a raw, unambiguous value.
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const daySchema = new Schema(
  {
    day: { type: String, enum: DAYS_OF_WEEK, required: true },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false }
);

const doctorAvailabilitySchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true },
    // Days with no configured slots simply aren't in this array — absence
    // means "not available that day", not an empty entry.
    schedule: { type: [daySchema], default: [] },
  },
  { timestamps: true }
);

doctorAvailabilitySchema.statics.DAYS_OF_WEEK = DAYS_OF_WEEK;

module.exports =
  mongoose.models.DoctorAvailability || mongoose.model("DoctorAvailability", doctorAvailabilitySchema);