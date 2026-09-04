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
const validateObjectId = require("../middleware/validateObjectId");

// Admin Routes
router.post("/", protect, admin, createCoupon);

router.get("/", protect, admin, getCoupons);

router.put(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  updateCoupon
);

router.delete(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  deleteCoupon
);

// User Route
router.post("/apply", protect, applyCoupon);

module.exports = router;