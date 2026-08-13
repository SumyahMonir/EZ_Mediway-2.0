const WaitingRoom = require("../models/waitingroomModel");
const Doctor = require("../models/doctorModel");

const normalizeDate = (date) => {
  // Must match UTC midnight, since a date-only string like "2026-07-25" is
  // parsed as UTC midnight both here and when Mongoose cast it on the
  // Appointment document. Using setHours() instead shifts by the server's
  // local timezone offset and silently breaks the equality match.
  const iso = new Date(date).toISOString().slice(0, 10);
  return new Date(`${iso}T00:00:00.000Z`);
};

// DOCTOR — open (or reopen) the waiting room for one of their own confirmed slots.
// Idempotent: if a room for this doctor+date+timeSlot is already "live", we
// return it unchanged instead of resetting the queue/callLink. Without this,
// a page refresh or a second effect run would wipe out any patient who had
// already joined, and clear a call link the doctor already set.
const openWaitingRoom = async (req, res) => {
  const { date, timeSlot } = req.body;

  if (req.user.Role !== "doctor") {
    return res.status(403).json({ error: "Only doctors can open a waiting room" });
  }

  if (!date || !timeSlot) {
    return res.status(400).json({ error: "date and timeSlot are required" });
  }

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const day = normalizeDate(date);

    const existing = await WaitingRoom.findOne({ doctorId: doctor._id, date: day, timeSlot });

    // Already open — don't touch it, just hand it back.
    if (existing && existing.status === "live") {
      return res.status(200).json(existing);
    }

    // Either no room exists yet, or it was previously "closed"/"ended" —
    // either way this is a genuinely fresh session, so a clean queue and a
    // cleared call link are correct here.
    const room = await WaitingRoom.findOneAndUpdate(
      { doctorId: doctor._id, date: day, timeSlot },
      {
        doctorId: doctor._id,
        date: day,
        timeSlot,
        status: "live",
        callLink: null,
        callActive: false,
        currentPatientId: null,
        queue: [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch the current state of a room — used on page load/refresh by both
// the doctor and patients before the socket connection takes over.
const getWaitingRoom = async (req, res) => {
  const { doctorId, date, timeSlot } = req.params;

  try {
    const room = await WaitingRoom.findOne({
      doctorId,
      date: normalizeDate(date),
      timeSlot,
    });

    if (!room) {
      return res.status(404).json({ error: "Waiting room not open for this slot" });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { openWaitingRoom, getWaitingRoom };