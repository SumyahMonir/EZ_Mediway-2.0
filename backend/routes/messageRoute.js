const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getConversation } = require("../controllers/messageController");

const router = express.Router();

router.get("/:doctorId/:patientId", requireAuth, getConversation);

module.exports = router;