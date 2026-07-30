const { default: mongoose } = require("mongoose")
const Users = require("../models/usermodel")

const getUsers = async (req, res) => {
    try {
        const users = await Users.find({}).populate("UserAuthId", "Email Role").sort({ createdAt: -1 })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params

    try {
        const user = await Users.findById(id).populate("UserAuthId", "Email Role")

        if (!user) {
            return res.status(404).json({ error: "No such user" })
        }

        res.status(200).json(user)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// NOTE: creating a patient directly is no longer how registration works.
// Use POST /api/auth/register with Role: "patient" instead.
const createUser = async (req, res) => {
    const { UserAuthId, name, email, nid, phone, weight, gender, bloodGroup } = req.body

    try {
        const user = await Users.create({ 
            UserAuthId, name, email, nid, phone, weight, gender, bloodGroup 
        })
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:"No Such user"})
    }

    const user = await Users.findOneAndDelete({_id:id})

    if (!user) {
            return res.status(404).json({ error: "No such user" })
        }

    res.status(200).json(user)
}

const updateUser = async (req,res)=> {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:"No Such user"})
    }

    const user = await Users.findOneAndUpdate({_id:id},
    
    {...req.body},
    { new: true, runValidators: true }, // add korlam new:true dile update howar porer data return korbe

)

    if (!user) {
            return res.status(404).json({ error: "No such user" })
        }

    res.status(200).json(user)
}

const getMyPatientProfile = async (req,res)=>{

    try{

        const patient = await Users.findOne({
            UserAuthId:req.user._id
        }).populate("UserAuthId","Email Role")
        console.log("UserAuthId from request:", req.user._id);
        console.log("Fetched patient profile:", patient);

        if(!patient){
            return res.status(404).json({
                error:"Patient not found"
            })
        }

        res.status(200).json(patient)

    }catch(error){

        res.status(500).json({
            error:error.message
        })

    }

}


module.exports = {
    getUsers,
    getUser,
    getMyPatientProfile,
    createUser,
    deleteUser,
    updateUser
}