const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }
  next();
};

// @GET /api/users — get all users (Admin only)
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @PUT /api/users/:id/role — update user role (Admin only)
router.put("/:id/role", auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Admin", "Member"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role. Use Admin or Member." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @DELETE /api/users/:id — delete user (Admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.deleteOne();
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
