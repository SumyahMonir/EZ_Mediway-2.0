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

// Lists this user's conversations, most recent first, with a preview of
// the last message — powers the chat drawer's list view. Kept as a plain
// find + in-JS dedup rather than an aggregation pipeline with $lookup, so
// it doesn't depend on guessing Mongoose's exact collection name for Users.
const getRecentConversations = async (req, res) => {
  try {
    let ownId;
    let matchField;
    let otherField;

    if (req.user.Role === "doctor") {
      const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
      if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
      ownId = doctor._id;
      matchField = "doctorId";
      otherField = "patientId";
    } else if (req.user.Role === "patient") {
      const patient = await Users.findOne({ UserAuthId: req.user._id });
      if (!patient) return res.status(404).json({ error: "Patient profile not found" });
      ownId = patient._id;
      matchField = "patientId";
      otherField = "doctorId";
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    const messages = await Message.find({ [matchField]: ownId }).sort({ createdAt: -1 });

    // Keep only the most recent message per distinct "other party" —
    // messages are already sorted newest-first, so the first one seen
    // for each otherId is the latest.
    const seen = new Set();
    const conversations = [];
    for (const m of messages) {
      const otherId = String(m[otherField]);
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      conversations.push({
        otherId,
        lastMessage: m.text,
        lastMessageAt: m.createdAt,
        lastSenderRole: m.senderRole,
      });
    }

    const otherIds = conversations.map((c) => c.otherId);
    const others =
      req.user.Role === "doctor"
        ? await Users.find({ _id: { $in: otherIds } }).select("name profileImage")
        : await Doctor.find({ _id: { $in: otherIds } }).select("name profileImage specialization slug");

    const otherMap = Object.fromEntries(others.map((o) => [String(o._id), o]));

    const result = conversations.map((c) => ({
      ...c,
      other: otherMap[c.otherId] || null,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getConversation, getRecentConversations, authorizeConversation };