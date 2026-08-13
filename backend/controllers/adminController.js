const Doctor = require("../models/doctorModel")
const Users = require("../models/userModel")

const getAdminStats = async (req, res) => {
    if (req.user.Role !== "admin") {
        return res.status(403).json({ error: "Not authorized" })
    }

    try {
        const [totalDoctors, pendingDoctors, verifiedDoctors, rejectedDoctors, totalPatients] =
            await Promise.all([
                Doctor.countDocuments({}),
                Doctor.countDocuments({ verificationStatus: "pending" }),
                Doctor.countDocuments({ verificationStatus: "verified" }),
                Doctor.countDocuments({ verificationStatus: "rejected" }),
                Users.countDocuments({}),
            ])

        res.status(200).json({
            totalDoctors,
            pendingDoctors,
            verifiedDoctors,
            rejectedDoctors,
            totalPatients,
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { getAdminStats }