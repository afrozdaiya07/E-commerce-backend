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
const validateObjectId = require("../middleware/validateObjectId");

// ======================================
// USER ROUTES
// ======================================

// Place Order
router.post(
  "/",
  protect,
  placeOrder
);

// Get My Orders
router.get(
  "/",
  protect,
  getMyOrders
);

// Cancel My Order
router.put(
  "/:id/cancel",
  protect,
  validateObjectId("id"),
  cancelOrder
);

// ======================================
// ADMIN ROUTES
// ======================================

// Get All Orders
router.get(
  "/all",
  protect,
  admin,
  getAllOrders
);

// Update Order Status
router.put(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  updateOrderStatus
);

module.exports = router;