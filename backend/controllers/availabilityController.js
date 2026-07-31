const DoctorAvailability = require("../models/doctorAvailabilityModel");
const Doctor = require("../models/doctormodel");

const DAYS_OF_WEEK = DoctorAvailability.DAYS_OF_WEEK;

const validateSchedule = (schedule) => {
  if (!Array.isArray(schedule)) return "schedule must be an array";
  for (const entry of schedule) {
    if (!DAYS_OF_WEEK.includes(entry.day)) return `Invalid day: ${entry.day}`;
    if (!Array.isArray(entry.slots)) return `slots for ${entry.day} must be an array`;
    for (const slot of entry.slots) {
      if (!slot.startTime || !slot.endTime) {
        return `Every slot for ${entry.day} needs both a start and end time`;
      }
    }
  }
  return null;
};

// DOCTOR — fetch their own weekly schedule (used by the Manage Availability page)
const getMyAvailability = async (req, res) => {
  if (req.user.Role !== "doctor") {
    return res.status(403).json({ error: "Only doctors can access this" });
  }

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const availability = await DoctorAvailability.findOne({ doctorId: doctor._id });
    res.status(200).json(availability || { doctorId: doctor._id, schedule: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — replace their entire weekly schedule
const setAvailability = async (req, res) => {
  if (req.user.Role !== "doctor") {
    return res.status(403).json({ error: "Only doctors can set availability" });
  }

  const { schedule } = req.body;
  const validationError = validateSchedule(schedule || []);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    // Drop days with no real slots (both after trimming) — keeps the
    // stored document clean and matches "absence = not available".
    const cleanSchedule = schedule
      .map((entry) => ({
        day: entry.day,
        slots: entry.slots
          .map((s) => ({ startTime: s.startTime.trim(), endTime: s.endTime.trim() }))
          .filter((s) => s.startTime && s.endTime),
      }))
      .filter((entry) => entry.slots.length > 0);

    const availability = await DoctorAvailability.findOneAndUpdate(
      { doctorId: doctor._id },
      { doctorId: doctor._id, schedule: cleanSchedule },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Anyone authenticated (patients booking, admins, etc.) — read-only lookup
// of a specific doctor's weekly schedule
const getDoctorAvailability = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const availability = await DoctorAvailability.findOne({ doctorId });
    res.status(200).json(availability || { doctorId, schedule: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMyAvailability, setAvailability, getDoctorAvailability };