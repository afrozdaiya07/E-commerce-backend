const express = require("express");

const router = express.Router();

const {
  addProduct,
  getProducts,
  searchProducts,
  filterProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const upload = require("../middleware/uploadMiddleware");

// Public Routes
router.get("/", getProducts);

router.get("/search", searchProducts);

router.get("/filter", filterProducts);

router.get(
  "/:id",
  validateObjectId("id"),
  getSingleProduct
);

// Admin Routes
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  addProduct
);

router.put(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  admin,
  validateObjectId("id"),
  deleteProduct
);

module.exports = router;