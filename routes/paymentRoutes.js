const express = require("express");
const router = express.Router();

const {
  createPayment,
  getMyPayments,
  updatePaymentStatus,
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

// Create Payment
router.post("/", protect, createPayment);
router.put("/:id", protect, updatePaymentStatus);

// Get My Payments
router.get("/my", protect, getMyPayments);

module.exports = router;