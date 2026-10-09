const express = require("express");

const {
  createPaymentOrder,
  verifyPayment
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Razorpay payment order
router.post(
  "/create-order",
  protect,
  createPaymentOrder
);

// Verify successful payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

module.exports = router;