const express = require("express");
const { openWaitingRoom, getWaitingRoom } = require("../controllers/waitingroomController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/open", requireAuth, openWaitingRoom); // doctor-only, checked inside controller
router.get("/:doctorId/:date/:timeSlot", requireAuth, getWaitingRoom);

module.exports = router;