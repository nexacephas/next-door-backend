import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// --------------------
// ADMIN / USER ROUTES
// --------------------

// Get all users (admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// Delete a user (admin only)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await user.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

// Admin dashboard stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({
      success: true,
      data: { userCount },
      message: "Admin dashboard stats",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load stats",
      error: error.message,
    });
  }
});

export default router;
