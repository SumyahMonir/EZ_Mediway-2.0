const { default: mongoose } = require("mongoose")
const Users=require("../models/usermodel")

const getUsers = async (req, res) => {
    try {
        const users = await Users.find({}).sort({ createdAt: -1 })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params

    try {
        const user = await Users.findById(id)

        if (!user) {
            return res.status(404).json({ error: "No such user" })
        }

        res.status(200).json(user)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createUser = async (req, res) => {
    console.log(req.body)
    const { Name,NID,Email,Phone,Weight,Blood_Grp } = req.body

    try {
        const user = await Users.create({ Name,NID,Email,Phone,Weight,Blood_Grp })
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

    const user = await Users.findOneAndUpdate({_id:id},{
        ...req.body
    })

    if (!user) {
            return res.status(404).json({ error: "No such user" })
        }

    res.status(200).json(user)
}



module.exports = {
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}