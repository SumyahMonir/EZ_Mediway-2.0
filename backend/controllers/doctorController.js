const { default: mongoose } = require("mongoose")
const Doctor = require("../models/doctormodel")
const supabase = require("../config/supabase")
const { v4: uuidv4 } = require("uuid")

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).populate("UserAuthId", "Email Role").sort({ createdAt: -1 })
        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

//for admins
const getDoctor = async (req, res) => {
    const { id } = req.params

    if (req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized to view this profile" })
    }

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

//for general people
const getDoctorBySlug = async (req, res) => {
    const { slug } = req.params

    try {
        const doctor = await Doctor.findOne({ slug }).populate("UserAuthId", "Email Role -_id")

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such doctor" })
    }

    const doctor = await Doctor.findById(id)

    if (!doctor) {
        return res.status(404).json({ error: "No such doctor" })
    }

    // ownership check — only the doctor themself or an admin can delete
    if (doctor.UserAuthId.toString() !== req.user._id.toString() && req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized to delete this profile" })
    }

    const deleted = await Doctor.findOneAndDelete({ _id: id })

    res.status(200).json(deleted)
}
const updateDoctor = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such doctor" })
    }

    const doctor = await Doctor.findById(id)
    if (!doctor) {
        return res.status(404).json({ error: "No such doctor" })
    }

    // ownership check — adjust based on how you store roles
    if (doctor.UserAuthId.toString() !== req.user._id.toString() && req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized to update this profile" })
    }

    const updated = await Doctor.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true })
    res.status(200).json(updated)
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

const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("doctor-profiles")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            return res.status(500).json({ message: uploadError.message });
        }

        // Get public URL
        const { data } = supabase.storage
            .from("doctor-profiles")
            .getPublicUrl(filePath);

        const publicUrl = data.publicUrl;

        // Save to Doctor doc
        const doctor = await Doctor.findOneAndUpdate(
            { UserAuthId: req.user._id }, // matches getMyDoctorProfile's convention
            { profileImage: publicUrl },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found for this user" });
        }

        res.status(200).json({ message: "Image uploaded", doctor });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getDoctors,
    getDoctor,
    getDoctorBySlug,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor,
    uploadProfileImage
}