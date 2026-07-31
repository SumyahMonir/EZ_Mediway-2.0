const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getMyAvailability,
  setAvailability,
  getDoctorAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

router.get("/me", requireAuth, getMyAvailability);
router.put("/me", requireAuth, setAvailability);
router.get("/:doctorId", requireAuth, getDoctorAvailability);

module.exports = router;