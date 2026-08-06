const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const Appointment = require("../models/appointmentmodel");
const Doctor = require("../models/doctormodel");
const Users = require("../models/usermodel");

// A chat only exists between a doctor and patient who've actually had at
// least one appointment together — and only the two of them can access it.
const authorizeConversation = async (req, doctorId, patientId) => {
  const hasHistory = await Appointment.findOne({ doctorId, patientId });
  if (!hasHistory) {
    return { ok: false, error: "No appointment history between this doctor and patient" };
  }

  if (req.user.Role === "doctor") {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor || String(doctor._id) !== String(doctorId)) {
      return { ok: false, error: "Not authorized for this conversation" };
    }
  } else if (req.user.Role === "patient") {
    const patient = await Users.findOne({ UserAuthId: req.user._id });
    if (!patient || String(patient._id) !== String(patientId)) {
      return { ok: false, error: "Not authorized for this conversation" };
    }
  } else {
    return { ok: false, error: "Not authorized" };
  }

  return { ok: true };
};

// Fetches the full message history for a doctor+patient pair
const getConversation = async (req, res) => {
  const { doctorId, patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: "Invalid doctorId or patientId" });
  }

  try {
    const auth = await authorizeConversation(req, doctorId, patientId);
    if (!auth.ok) return res.status(403).json({ error: auth.error });

    const messages = await Message.find({ doctorId, patientId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getConversation, authorizeConversation };