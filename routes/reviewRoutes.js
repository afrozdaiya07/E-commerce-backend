const express = require("express");
const router = express.Router();

const {
  addReview,
  getProductReviews,
  deleteReview,
  getAverageRating,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Add Review
router.post("/", protect, addReview);

// Get Average Rating
router.get(
  "/rating/:productId",
  validateObjectId("productId"),
  getAverageRating
);

// Get Product Reviews
router.get(
  "/:productId",
  validateObjectId("productId"),
  getProductReviews
);

// Delete Review
router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteReview
);

module.exports = router;