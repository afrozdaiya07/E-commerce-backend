const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// Get Profile
router.get("/profile", protect, getMyProfile);

// Update Profile
router.put("/profile", protect, updateMyProfile);

// Change Password
router.put("/change-password", protect, changePassword);

// Delete Account
router.delete("/profile", protect, deleteMyAccount);

module.exports = router;