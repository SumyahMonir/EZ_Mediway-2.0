const express = require('express')
const Users=require("../models/usermodel")
const {getUsers,
    getUser,
    getMyPatientProfile,
    createUser,
    deleteUser,
    updateUser
}=require("../controllers/UserController")

const requireAuth = require("../middleware/requireAuth");

const router = express.Router()
router.use(requireAuth);

router.get('/', getUsers)
router.get("/me", getMyPatientProfile) //add disi ekn
router.get('/:id', getUser)


router.post('/',createUser )
router.delete('/:id', deleteUser)

router.patch('/:id',updateUser)

module.exports = router