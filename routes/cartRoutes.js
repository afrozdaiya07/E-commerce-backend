const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Add to Cart
router.post("/", protect, addToCart);

// Get My Cart
router.get("/", protect, getCart);

// Update Cart Item
router.put(
  "/:id",
  protect,
  validateObjectId("id"),
  updateCart
);

// Remove Cart Item
router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  removeFromCart
);

module.exports = router;