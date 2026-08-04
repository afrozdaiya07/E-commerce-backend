const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cartController");
const protect = require("../middleware/authMiddleware");

// Add To Cart
router.post("/", protect, addToCart);

// Get Cart
router.get("/", protect, getCart);
router.put("/:id", protect, updateCart);
router.delete("/:id", protect, removeFromCart);

module.exports = router;