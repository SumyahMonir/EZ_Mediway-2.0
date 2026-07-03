const { default: mongoose } = require("mongoose")
const Doctor = require("../models/doctormodel")

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).populate("UserAuthId", "Email Role").sort({ createdAt: -1 })
        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getDoctor = async (req, res) => {
    const { id } = req.params

    try {
        const doctor = await Doctor.findById(id).populate("UserAuthId", "Email Role")

        if (!doctor) {
            return res.status(404).json({ error: "No such doctor" })
        }

        res.status(200).json(doctor)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// NOTE: creating a doctor directly is no longer how registration works.
// Use POST /api/auth/register with Role: "doctor" instead.
// Kept here only in case you need to create a profile for an existing UserAuthId.
const createDoctor = async (req, res) => {
    const { UserAuthId, Name, NID, Phone, Fee, License_no } = req.body

    try {
        const doctor = await Doctor.create({ UserAuthId, Name, NID, Phone, Fee, License_no })
        res.status(201).json(doctor)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteDoctor = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:"No Such doctor"})
    }

    const doctor = await Doctor.findOneAndDelete({_id:id})

    if (!doctor) {
            return res.status(404).json({ error: "No such doctor" })
        }

    res.status(200).json(doctor)
}

const updateDoctor = async (req,res)=> {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:"No Such doctor"})
    }

    const doctor = await Doctor.findOneAndUpdate({_id:id},{
        ...req.body
    })

    if (!doctor) {
            return res.status(404).json({ error: "No such doctor" })
        }

    res.status(200).json(doctor)
}

const getMyDoctorProfile = async (req, res) => {

    try {

        const doctor = await Doctor.findOne({
            UserAuthId: req.user._id
        }).populate("UserAuthId","Email Role")

        if(!doctor){
            return res.status(404).json({
                error:"Doctor not found"
            })
        }

        res.status(200).json(doctor)

    } catch(error){

        res.status(500).json({
            error:error.message
        })

    }

}



module.exports = {
    getDoctors,
    getDoctor,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor
}