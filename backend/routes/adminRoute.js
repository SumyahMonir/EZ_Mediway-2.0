const express = require("express")
const { getAdminStats } = require("../controllers/adminController")
const requireAuth = require("../middleware/requireAuth")

const router = express.Router()

router.get("/stats", requireAuth, getAdminStats) // admin-only, checked inside controller

module.exports = router