const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Add to Wishlist
router.post("/", protect, addToWishlist);

// Get Wishlist
router.get("/", protect, getWishlist);

// Remove from Wishlist
router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  removeFromWishlist
);

module.exports = router;