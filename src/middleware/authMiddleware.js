import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes (check for valid token)
export const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB, excluding password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // token is valid, continue
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // user is admin, continue
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
