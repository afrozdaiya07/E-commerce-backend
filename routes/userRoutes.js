const express = require("express");

const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,

  // Admin User Management
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ======================================
// USER ROUTES
// ======================================

// Get Profile
router.get(
  "/profile",
  protect,
  getMyProfile
);

// Update Profile
router.put(
  "/profile",
  protect,
  updateMyProfile
);

// Change Password
router.put(
  "/change-password",
  protect,
  changePassword
);

// Delete Account
router.delete(
  "/profile",
  protect,
  deleteMyAccount
);

// ======================================
// ADMIN USER MANAGEMENT
// ======================================

// Get All Users
router.get(
  "/admin",
  protect,
  admin,
  getAllUsers
);

// Update User Role
router.put(
  "/admin/:id/role",
  protect,
  admin,
  validateObjectId("id"),
  updateUserRole
);

// Delete User
router.delete(
  "/admin/:id",
  protect,
  admin,
  validateObjectId("id"),
  deleteUserByAdmin
);

module.exports = router;