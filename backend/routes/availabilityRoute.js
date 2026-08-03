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

// Public — same access level as GET /doctors and /doctors/slug/:slug.
// Schedule data isn't sensitive, and this needs to be visible to
// logged-out visitors browsing doctor cards.
router.get("/:doctorId", getDoctorAvailability);

module.exports = router;