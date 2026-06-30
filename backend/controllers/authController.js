const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserAuth = require("../models/userAuthModel");
const Users = require("../models/usermodel");
const Doctor = require("../models/doctormodel");

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.SECRET, { expiresIn: "3d" });
};

const registerUser = async (req, res) => {
  const { Email, Password, Role, ...profileFields } = req.body;

  try {
    if (!Email || !Password || !Role) {
      return res.status(400).json({ error: "Email, Password and Role are required." });
    }

    const existing = await UserAuth.findOne({ Email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const auth = await UserAuth.create({ Email, Password, Role });

    let profile;

    try {
      if (Role === "patient") {
        profile = await Users.create({ UserAuthId: auth._id, ...profileFields });
      } else if (Role === "doctor") {
        profile = await Doctor.create({ UserAuthId: auth._id, ...profileFields });
      } else {
        throw new Error("Invalid role.");
      }
    } catch (profileErr) {
      // rollback auth record if profile creation fails
      await UserAuth.findByIdAndDelete(auth._id);
      throw profileErr;
    }

    const token = createToken(auth._id, Role);

    res.status(201).json({ Email, Role, token, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    if (!Email || !Password) {
      return res.status(400).json({ error: "Email and Password are required." });
    }

    const auth = await UserAuth.findOne({ Email });
    if (!auth) {
      return res.status(400).json({ error: "Incorrect email." });
    }

    const match = await bcrypt.compare(Password, auth.Password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    let profile;
    if (auth.Role === "patient") {
      profile = await Users.findOne({ UserAuthId: auth._id });
    } else if (auth.Role === "doctor") {
      profile = await Doctor.findOne({ UserAuthId: auth._id });
    }

    const token = createToken(auth._id, auth.Role);

    res.status(200).json({ Email: auth.Email, Role: auth.Role, token, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };