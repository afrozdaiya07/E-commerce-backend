const express = require("express");
const router = express.Router();
const {
  addReview,
  getProductReviews,
  deleteReview,
  getAverageRating,
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, addReview);
router.get("/:productId", getProductReviews);
router.get("/rating/:productId", getAverageRating);
router.delete("/:id", protect, deleteReview);

module.exports = router;