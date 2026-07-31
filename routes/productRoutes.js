const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, addProduct);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;