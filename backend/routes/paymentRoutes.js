// routes/paymentRoute.js
const express = require("express");
const router = express.Router();
const { initiatePayment, paymentCallback } = require("../controllers/paymentController");
const requireAuth = require("../middleware/requireAuth");

router.post("/bkash/create", requireAuth, initiatePayment);
router.get("/bkash/callback", paymentCallback);

module.exports = router;