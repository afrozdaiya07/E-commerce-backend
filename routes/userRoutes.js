const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// Get My Profile
router.get("/profile", protect, getMyProfile);
router.put("/change-password", protect, changePassword);
router.delete("/profile", protect, deleteMyAccount);

// Update My Profile
router.put("/profile", protect, updateMyProfile);

module.exports = router;