const express = require("express");

const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// User Routes
router.post("/", protect, placeOrder);

router.get("/", protect, getMyOrders);

router.put("/:id/cancel", protect, cancelOrder);

// Admin Routes
router.get("/all", protect, admin, getAllOrders);

router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;