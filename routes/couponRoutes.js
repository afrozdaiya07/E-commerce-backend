const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getCoupons,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin: Create Coupon
router.post("/", protect, admin, createCoupon);
router.post("/apply", protect, applyCoupon);
router.put("/:id", protect, admin, updateCoupon);

router.delete("/:id", protect, admin, deleteCoupon);

// Admin: Get All Coupons
router.get("/", protect, admin, getCoupons);

module.exports = router;