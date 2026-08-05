const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  uploadImage
);

module.exports = router;