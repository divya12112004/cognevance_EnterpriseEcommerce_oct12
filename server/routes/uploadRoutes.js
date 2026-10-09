const express = require("express");

const {
  uploadProductImage
} = require("../controllers/uploadController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Admin-only product image upload
router.post(
  "/product-image",
  protect,
  adminOnly,
  upload.single("image"),
  uploadProductImage
);

module.exports = router;