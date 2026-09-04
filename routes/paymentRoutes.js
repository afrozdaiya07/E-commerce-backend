const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
  updatePaymentStatus,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Create Payment
router.post("/", protect, createPayment);

// Get My Payments
router.get("/my", protect, getMyPayments);

// Update Payment
router.put(
  "/:id",
  protect,
  validateObjectId("id"),
  updatePaymentStatus
);

module.exports = router;