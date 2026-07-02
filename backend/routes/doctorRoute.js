const express = require('express')
const Doctor=require("../models/doctormodel")
const {getDoctors,
    getDoctor,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor
}=require("../controllers/doctorController")

const requireAuth = require("../middleware/requireAuth");

const router = express.Router()
router.use(requireAuth);

router.get('/', getDoctors)
router.get("/me", getMyDoctorProfile);
router.get('/:id', getDoctor)

router.post('/',createDoctor )
router.delete('/:id', deleteDoctor)

router.patch('/:id',updateDoctor)

module.exports = router