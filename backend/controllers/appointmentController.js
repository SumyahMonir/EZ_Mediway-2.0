const mongoose = require("mongoose");
const Appointment = require("../models/appointmentmodel");
const Doctor = require("../models/doctormodel");
const Users = require("../models/usermodel");

// PATIENT — book an appointment
const createAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;

  if (req.user.Role !== "patient") {
    return res.status(403).json({ error: "Only patients can book appointments" });
  }

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ error: "doctorId, date and timeSlot are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ error: "Invalid doctor ID" });
  }

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor || doctor.verificationStatus !== "verified") {
      return res.status(404).json({ error: "Doctor not available for booking" });
    }

    const patient = await Users.findOne({ UserAuthId: req.user._id });
    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      consultationFee: doctor.consultationFee,
      date,
      timeSlot,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PATIENT — see their own bookings
const getMyAppointments = async (req, res) => {
  try {
    const patient = await Users.findOne({ UserAuthId: req.user._id });
    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name specialization hospital profileImage slug")
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — see bookings made with them
const getMyDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name phone")
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — confirm, mark not available, or mark completed
// PATIENT — cancel their own appointment
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, doctorMessage } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such appointment" });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "No such appointment" });
    }

    // ---- DOCTOR PATH (unchanged from before) ----
    if (req.user.Role === "doctor") {
      const allowedStatuses = ["confirmed", "not_available", "completed"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ error: "Not authorized to update this appointment" });
      }

      const updates = { status };
      if (status === "not_available") {
        updates.doctorMessage = doctorMessage || "";
      }

      const updated = await Appointment.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).json(updated);
    }

    // ---- PATIENT PATH (new) — patients may only cancel ----
    if (req.user.Role === "patient") {
      if (status !== "Cancelled") {
        return res.status(400).json({ error: "Patients can only cancel appointments" });
      }

      const patient = await Users.findOne({ UserAuthId: req.user._id });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({ error: "Not authorized to update this appointment" });
      }

      if (appointment.status === "completed") {
        return res.status(400).json({ error: "Cannot cancel a completed appointment" });
      }

      if (appointment.status === "Cancelled") {
        return res.status(400).json({ error: "Appointment is already cancelled" });
      }

      const updated = await Appointment.findByIdAndUpdate(
        id,
        { status: "Cancelled" },
        { new: true }
      );
      return res.status(200).json(updated);
    }

    return res.status(403).json({ error: "Not authorized to update this appointment" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getMyDoctorAppointments,
  updateAppointmentStatus,
};