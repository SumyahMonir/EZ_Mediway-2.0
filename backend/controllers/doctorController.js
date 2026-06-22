const { default: mongoose } = require("mongoose")
const Doctor=require("../models/doctormodel")

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).sort({ createdAt: -1 })
        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getDoctor = async (req, res) => {
    const { id } = req.params

    try {
        const doctor = await Doctor.findById(id)

        if (!doctor) {
            return res.status(404).json({ error: "No such doctor" })
        }

        res.status(200).json(doctor)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createDoctor = async (req, res) => {
    console.log(req.body)
    const { Name,NID,Email,Phone,Fee,License_No } = req.body

    try {
        const doctor = await Doctor.create({ Name,NID,Email,Phone,Fee,License_No })
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



module.exports = {
    getDoctors,
    getDoctor,
    createDoctor,
    deleteDoctor,
    updateDoctor
}