const User = require("../models/User");
const bcrypt = require("bcryptjs");

const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Address = require("../models/Address");
const Review = require("../models/Review");
const Order = require("../models/Order");

// ======================================
// Get My Profile
// ======================================
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update My Profile
// ======================================
const updateMyProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (name) {
      user.name = name.trim();
    }

    if (email) {
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Change Password
// ======================================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current Password and New Password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current Password is Incorrect",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete My Account
// ======================================
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Delete User Related Data
    await Cart.deleteMany({
      user: userId,
    });

    await Wishlist.deleteMany({
      user: userId,
    });

    await Address.deleteMany({
      user: userId,
    });

    await Review.deleteMany({
      user: userId,
    });

    await Order.deleteMany({
      user: userId,
    });

    // Delete User
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message:
        "Account and Related Data Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ADMIN - Get All Users
// ======================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ADMIN - Update User Role
// ======================================
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Only user/admin allowed
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be user or admin",
      });
    }

    // Prevent admin from changing own role
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    user.role = role;

    await user.save();

    const safeUser = user.toObject();

    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: "User Role Updated Successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// ADMIN - Delete User
// ======================================
const deleteUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // Delete User Related Data
    await Cart.deleteMany({
      user: userId,
    });

    await Wishlist.deleteMany({
      user: userId,
    });

    await Address.deleteMany({
      user: userId,
    });

    await Review.deleteMany({
      user: userId,
    });

    await Order.deleteMany({
      user: userId,
    });

    // Delete User
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message:
        "User and Related Data Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,

  // Admin User Management
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
};