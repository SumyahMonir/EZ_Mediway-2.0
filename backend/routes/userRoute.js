const express = require('express')
const Users=require("../models/usermodel")
const {getUsers,
    getUser,
    getMyPatientProfile,
    createUser,
    deleteUser,
    updateUser,
    uploadProfileImage
}=require("../controllers/UserController")
const upload = require("../middleware/upload");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router()
router.use(requireAuth);

router.get('/', getUsers)
router.get("/me", getMyPatientProfile) //add disi ekn
router.get('/:id', getUser)


router.post('/',createUser )
router.delete('/:id', deleteUser)

router.patch('/:id',updateUser)
router.post("/upload-profile-image", requireAuth, upload.single("image"), uploadProfileImage)

module.exports = router