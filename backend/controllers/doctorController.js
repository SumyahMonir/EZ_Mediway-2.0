const { default: mongoose } = require("mongoose")
const Doctor = require("../models/doctormodel")
const supabase = require("../config/supabase")
const crypto = require("crypto")

// Fields a doctor (or admin) is allowed to change through the general
// update endpoint. Verification status, registrationNumber, totalPatients,
// etc. are intentionally excluded — those only change through dedicated
// approve/reject endpoints.
const DOCTOR_EDITABLE_FIELDS = [
    "name",
    "phone",
    "professionalTitle",
    "specialization",
    "qualifications",
    "hospital",
    "experience",
    "consultationFee",
    "description",
    "languages",
    "isAvailable",
]

// PUBLIC — only ever shows verified doctors
const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ verificationStatus: "verified" })
            .populate("UserAuthId", "Email Role")
            .sort({ createdAt: -1 })
        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// PUBLIC — only ever shows verified doctors
const getDoctorBySlug = async (req, res) => {
    const { slug } = req.params

    try {
        const doctor = await Doctor.findOne({ slug, verificationStatus: "verified" })
            .populate("UserAuthId", "Email Role -_id")

        if (!doctor) {
            return res.status(404).json({ error: "No such doctor" })
        }

        res.status(200).json(doctor)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// ADMIN ONLY — full detail view, used by the "Review" button
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

// ADMIN ONLY — list filtered by status, e.g. /api/doctors/admin/list?status=pending
const getDoctorsForAdmin = async (req, res) => {
    if (req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized" })
    }

    const { status } = req.query // "pending" | "verified" | "rejected" | omitted = all

    try {
        const filter = status ? { verificationStatus: status } : {}
        const doctors = await Doctor.find(filter)
            .populate("UserAuthId", "Email Role")
            .sort({ createdAt: -1 })

        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// NOTE: creating a doctor directly is no longer how registration works.
// Use POST /api/auth/register with Role: "doctor" instead.
const createDoctor = async (req, res) => {
    const { UserAuthId, name, nid, phone, consultationFee, registrationNumber } = req.body

    try {
        const doctor = await Doctor.create({ UserAuthId, name, nid, phone, consultationFee, registrationNumber })
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

    const isAdmin = req.user.Role === "admin"
    const isOwner = doctor.UserAuthId.toString() === req.user._id.toString()

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Not authorized to update this profile" })
    }

    // Whitelist — only allow fields we actually intend to be self/admin editable
    const updates = {}
    for (const field of DOCTOR_EDITABLE_FIELDS) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field]
        }
    }

    // If the doctor (not admin) edits their own already-verified profile,
    // drop back to pending — admin needs to re-review the changes.
    if (isOwner && !isAdmin && doctor.verificationStatus === "verified") {
        updates.verificationStatus = "pending"
        updates.isVerified = false
    }

    const updated = await Doctor.findOneAndUpdate({ _id: id }, updates, { new: true })
    res.status(200).json(updated)
}

// ADMIN ONLY
const approveDoctor = async (req, res) => {
    if (req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized" })
    }

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such doctor" })
    }

    const doctor = await Doctor.findByIdAndUpdate(
        id,
        { verificationStatus: "verified", isVerified: true, rejectionReason: "" },
        { new: true }
    )

    if (!doctor) {
        return res.status(404).json({ error: "No such doctor" })
    }

    res.status(200).json(doctor)
}

// ADMIN ONLY
const rejectDoctor = async (req, res) => {
    if (req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized" })
    }

    const { id } = req.params
    const { reason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such doctor" })
    }

    const doctor = await Doctor.findByIdAndUpdate(
        id,
        { verificationStatus: "rejected", isVerified: false, rejectionReason: reason || "" },
        { new: true }
    )

    if (!doctor) {
        return res.status(404).json({ error: "No such doctor" })
    }

    res.status(200).json(doctor)
}

const getMyDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ UserAuthId: req.user._id })
            .populate("UserAuthId", "Email Role")

        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" })
        }

        res.status(200).json(doctor)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("doctor-profiles")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            return res.status(500).json({ message: uploadError.message });
        }

        const { data } = supabase.storage
            .from("doctor-profiles")
            .getPublicUrl(filePath);

        const doctor = await Doctor.findOneAndUpdate(
            { UserAuthId: req.user._id },
            { profileImage: data.publicUrl },
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
    getDoctorsForAdmin,
    getMyDoctorProfile,
    createDoctor,
    deleteDoctor,
    updateDoctor,
    approveDoctor,
    rejectDoctor,
    uploadProfileImage,
}