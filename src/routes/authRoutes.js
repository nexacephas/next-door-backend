import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { googleAuth, facebookAuth } from "../config/passport.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// --------------------
// EMAIL/PASSWORD REGISTRATION
// --------------------
router.post("/register", async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "Please fill all fields" });
  }

  try {
    let userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: "Email already exists" });

    // ✅ Automatically detect admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const isAdmin = adminEmails.includes(email);

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      isAdmin,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});


// --------------------
// EMAIL/PASSWORD LOGIN
// --------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin, // ✅ important for admin detection
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});


// --------------------
// SOCIAL LOGIN ROUTES
// --------------------

// Google login
router.get("/social/google", googleAuth);

// Google callback (JWT)
router.get(
  "/social/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/social-callback?token=${token}`);
  }
);

// Facebook login
router.get("/social/facebook", facebookAuth);

// Facebook callback (JWT)
router.get(
  "/social/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/social-callback?token=${token}`);
  }
);

// --------------------
// ADMIN / USER ROUTES
// --------------------

// Get current user (by token)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
});

// Get all users (admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
});

// Delete a user (admin only)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
});

// Admin dashboard stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ success: true, data: { userCount }, message: "Admin dashboard stats" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load stats", error: error.message });
  }
});

// --------------------
// PASSWORD RESET ROUTES
// --------------------
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;

