// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Your user schema

const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token malformed or missing" });

    // Verify token and get payload (assumed payload has user id in 'id')
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) return res.status(401).json({ message: "Invalid token payload" });

    // Fetch user from DB without password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("Authenticated user role:", user.role);

    // Attach user info to request
    req.user = user;

    // Proceed to next middleware or controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
