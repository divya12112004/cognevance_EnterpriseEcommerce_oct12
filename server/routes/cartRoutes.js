const express = require("express");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All cart operations require login
router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.put("/:itemId", protect, updateCartItem);

router.delete("/:itemId", protect, removeFromCart);

module.exports = router;