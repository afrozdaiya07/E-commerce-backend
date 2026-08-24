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

// User Routes
router.post("/", protect, placeOrder);

router.get("/", protect, getMyOrders);

router.put(
  "/:id/cancel",
  protect,
  validateObjectId("id"),
  cancelOrder
);

// Admin Routes
router.get(
  "/all",
  protect,
  admin,
  getAllOrders
);

router.put(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  updateOrderStatus
);

module.exports = router;