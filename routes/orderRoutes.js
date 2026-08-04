const express = require("express");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/", protect, getMyOrders);
router.get("/all", protect, getAllOrders);

router.put("/:id", protect, updateOrderStatus);

module.exports = router;