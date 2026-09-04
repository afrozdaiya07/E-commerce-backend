const express = require("express");
const router = express.Router();

const {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Add Address
router.post("/", protect, addAddress);

// Get My Addresses
router.get("/", protect, getMyAddresses);

// Update Address
router.put(
  "/:id",
  protect,
  validateObjectId("id"),
  updateAddress
);

// Delete Address
router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteAddress
);

module.exports = router;