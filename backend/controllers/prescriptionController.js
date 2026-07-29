const mongoose = require("mongoose");
const crypto = require("crypto");
const Prescription = require("../models/prescriptionModel");
const Doctor = require("../models/doctormodel");
const Users = require("../models/usermodel");
const Appointment = require("../models/appointmentmodel");
const supabase = require("../config/supabase");
const { generatePrescriptionPdfBuffer } = require("../utils/generatePrescriptionPdf");

// Trims/cleans the editable fields and enforces the required-field rules —
// shared by create and update so both apply the same validation.
const validatePrescriptionBody = (body) => {
  const errors = [];
  const diagnosis = (body.diagnosis || "").trim();
  if (!diagnosis) errors.push("Diagnosis is required");

  const medicines = (body.medicines || [])
    .map((m) => ({
      medicine: (m.medicine || "").trim(),
      strength: (m.strength || "").trim(),
      dosage: (m.dosage || "").trim(),
      frequency: (m.frequency || "").trim(),
      duration: (m.duration || "").trim(),
      instruction: (m.instruction || "").trim(),
    }))
    .filter((m) => m.medicine); // drop empty rows

  if (medicines.length === 0) errors.push("At least one medicine is required");

  const tests = (body.tests || [])
    .map((t) => ({ testName: (t.testName || "").trim() }))
    .filter((t) => t.testName);

  return {
    errors,
    clean: {
      diagnosis,
      medicines,
      tests,
      advice: (body.advice || "").trim(),
      followUp: (body.followUp || "").trim(),
      additionalNotes: (body.additionalNotes || "").trim(),
    },
  };
};

// Renders the PDF, uploads it to the Supabase "prescriptions" bucket, and
// saves the resulting public URL on the prescription document. Shared by
// the standalone /pdf endpoint and /send (which generates one if missing).
const buildAndUploadPdf = async (prescriptionId) => {
  const full = await Prescription.findById(prescriptionId)
    .populate("doctorId")
    .populate("patientId")
    .populate("appointmentId");

  if (!full) throw new Error("Prescription not found");

  const pdfBuffer = await generatePrescriptionPdfBuffer({
    doctor: full.doctorId,
    patient: full.patientId,
    appointment: full.appointmentId,
    prescription: full,
  });

  const fileName = `${full._id}-${crypto.randomBytes(4).toString("hex")}.pdf`;
  const filePath = `prescriptions/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("prescriptions")
    .upload(filePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("prescriptions").getPublicUrl(filePath);

  full.pdfUrl = data.publicUrl;
  await full.save();
  return full;
};

// DOCTOR — create a prescription (defaults to "draft" unless status is passed)
const createPrescription = async (req, res) => {
  if (req.user.Role !== "doctor") {
    return res.status(403).json({ error: "Only doctors can create prescriptions" });
  }

  const { patientId, appointmentId } = req.body;
  if (!patientId || !appointmentId) {
    return res.status(400).json({ error: "patientId and appointmentId are required" });
  }
  if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ error: "Invalid patientId or appointmentId" });
  }

  const { errors, clean } = validatePrescriptionBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || String(appointment.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ error: "Not authorized for this appointment" });
    }

    const prescription = await Prescription.create({
      doctorId: doctor._id,
      patientId,
      appointmentId,
      ...clean,
      status: req.body.status === "completed" ? "completed" : "draft",
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — update their own prescription
const updatePrescription = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: "No such prescription" });

  const { errors, clean } = validatePrescriptionBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    const prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ error: "No such prescription" });
    if (!doctor || String(prescription.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ error: "Not authorized to edit this prescription" });
    }

    const updates = { ...clean };
    if (req.body.status && ["draft", "completed", "sent"].includes(req.body.status)) {
      updates.status = req.body.status;
    }

    const updated = await Prescription.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — delete their own prescription
const deletePrescription = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: "No such prescription" });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    const prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ error: "No such prescription" });
    if (!doctor || String(prescription.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ error: "Not authorized to delete this prescription" });
    }

    await Prescription.findByIdAndDelete(id);
    res.status(200).json({ message: "Prescription deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR (their own) or PATIENT (their own) — fetch a single prescription
const getPrescription = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: "No such prescription" });

  try {
    const prescription = await Prescription.findById(id)
      .populate("doctorId", "name professionalTitle specialization registrationNumber phone")
      .populate("patientId", "name gender bloodGroup phone profileImage")
      .populate("appointmentId", "date timeSlot");

    if (!prescription) return res.status(404).json({ error: "No such prescription" });

    if (req.user.Role === "doctor") {
      const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
      if (!doctor || String(prescription.doctorId._id) !== String(doctor._id)) {
        return res.status(403).json({ error: "Not authorized to view this prescription" });
      }
    } else if (req.user.Role === "patient") {
      const patient = await Users.findOne({ UserAuthId: req.user._id });
      if (!patient || String(prescription.patientId._id) !== String(patient._id)) {
        return res.status(403).json({ error: "Not authorized to view this prescription" });
      }
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATIENT — their own prescriptions, newest first. Drafts are excluded —
// a patient should only ever see prescriptions the doctor finalized/sent.
const getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(patientId)) return res.status(400).json({ error: "Invalid patientId" });

  try {
    if (req.user.Role === "patient") {
      const patient = await Users.findOne({ UserAuthId: req.user._id });
      if (!patient || String(patient._id) !== String(patientId)) {
        return res.status(403).json({ error: "Not authorized" });
      }
    } else if (req.user.Role !== "doctor" && req.user.Role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const prescriptions = await Prescription.find({ patientId, status: { $ne: "draft" } })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — their own prescriptions (includes drafts)
const getDoctorPrescriptions = async (req, res) => {
  const { doctorId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorId)) return res.status(400).json({ error: "Invalid doctorId" });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    if (!doctor || String(doctor._id) !== String(doctorId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const prescriptions = await Prescription.find({ doctorId })
      .populate("patientId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — generate the PDF and upload it to Supabase, saving the public URL
const generatePdf = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: "No such prescription" });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    const prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ error: "No such prescription" });
    if (!doctor || String(prescription.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await buildAndUploadPdf(id);
    res.status(200).json({ pdfUrl: updated.pdfUrl, prescription: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR — mark as sent, generating the PDF first if one doesn't exist yet
const sendPrescription = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: "No such prescription" });

  try {
    const doctor = await Doctor.findOne({ UserAuthId: req.user._id });
    let prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ error: "No such prescription" });
    if (!doctor || String(prescription.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!prescription.pdfUrl) {
      prescription = await buildAndUploadPdf(id);
    }

    prescription.status = "sent";
    await prescription.save();

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  generatePdf,
  sendPrescription,
};