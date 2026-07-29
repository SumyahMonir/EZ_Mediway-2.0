const express = require("express");
const {
  createAppointment,
  getMyAppointments,
  getMyDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", requireAuth, createAppointment);
router.get("/me", requireAuth, getMyAppointments);              // patient's bookings
router.get("/doctor/me", requireAuth, getMyDoctorAppointments); // doctor's bookings

router.get("/:id", requireAuth, getAppointmentById);

router.patch("/:id/status", requireAuth, updateAppointmentStatus);



module.exports = router;