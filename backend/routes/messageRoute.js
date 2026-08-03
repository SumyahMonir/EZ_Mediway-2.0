const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getConversation, getRecentConversations } = require("../controllers/messageController");

const router = express.Router();

// Single-segment path — placed first so it can never collide with the
// two-segment "/:doctorId/:patientId" pattern below.
router.get("/conversations", requireAuth, getRecentConversations);

router.get("/:doctorId/:patientId", requireAuth, getConversation);

module.exports = router;