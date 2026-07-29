const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  generatePdf,
  sendPrescription,
} = require("../controllers/prescriptionController");

const router = express.Router();

router.post("/", requireAuth, createPrescription);
router.put("/:id", requireAuth, updatePrescription);
router.delete("/:id", requireAuth, deletePrescription);

// These specific paths must come before the generic "/:id" GET route below,
// otherwise Express would try to match "patient"/"doctor" as an :id value.
router.get("/patient/:patientId", requireAuth, getPatientPrescriptions);
router.get("/doctor/:doctorId", requireAuth, getDoctorPrescriptions);

router.post("/:id/pdf", requireAuth, generatePdf);
router.post("/:id/send", requireAuth, sendPrescription);
router.get("/:id", requireAuth, getPrescription);

module.exports = router;