const jwt = require("jsonwebtoken");
const UserAuth = require("../models/userauth");

const requireAuth = async (req, res, next) => {
  // Expect header: Authorization: Bearer <token>
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, process.env.SECRET);

    // Attach the authenticated user (without password) to the request
    req.user = await UserAuth.findById(id).select("-Password");

    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;