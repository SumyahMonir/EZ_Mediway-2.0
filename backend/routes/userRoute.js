const express = require('express')
const Users=require("../models/usermodel")
const {getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}=require("../controllers/UserController")

const router = express.Router()


router.get('/', getUsers)

router.get('/:id', getUser)

router.post('/',createUser )
router.delete('/:id', deleteUser)

router.patch('/:id',updateUser)

module.exports = router