const express = require('express')
const {
    getDoctors,
    getDoctor,
    getDoctorBySlug,
    getDoctorsForAdmin,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor,
    approveDoctor,
    rejectDoctor,
    uploadProfileImage,
} = require("../controllers/doctorController")
const upload = require("../middleware/upload");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router()

// ---- PUBLIC routes — no auth required ----
router.get('/', getDoctors)                    // public directory (verified doctors only)
router.get("/slug/:slug", getDoctorBySlug)      // public profile page

// ---- AUTHENTICATED routes ----
router.get("/me", requireAuth, getMyDoctorProfile)
router.get("/admin/list", requireAuth, getDoctorsForAdmin)   // admin-only, checked inside controller
router.get("/:id", requireAuth, getDoctor)                    // admin-only, checked inside controller

router.post('/', requireAuth, createDoctor)
router.delete('/:id', requireAuth, deleteDoctor)
router.patch('/:id', requireAuth, updateDoctor)

router.patch("/:id/approve", requireAuth, approveDoctor)      // admin-only, checked inside controller
router.patch("/:id/reject", requireAuth, rejectDoctor)        // admin-only, checked inside controller

router.post("/upload-profile-image", requireAuth, upload.single("image"), uploadProfileImage)

module.exports = router