const express = require('express')
const Doctor=require("../models/doctormodel")
const {getDoctors,
    getDoctor,
    getDoctorBySlug,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor
}=require("../controllers/doctorController")
const upload = require("../middleware/upload");
const { uploadProfileImage } = require("../controllers/doctorController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router()
router.use(requireAuth);

router.get('/', getDoctors)
router.get("/me", getMyDoctorProfile);
// routes/doctorRoutes.js
router.get("/slug/:slug", getDoctorBySlug)   // GET /api/doctors/slug/dr-john-smith
router.get("/:id", getDoctor)                 // keep the _id route too, for internal/admin use

router.post('/',createDoctor )
router.delete('/:id', deleteDoctor)

router.patch('/:id',updateDoctor)
router.post("/upload-profile-image", upload.single("image"), uploadProfileImage);

module.exports = router
