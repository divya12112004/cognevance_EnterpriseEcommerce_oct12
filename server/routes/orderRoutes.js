const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all orders
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

// Update order status
router.put(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create order from cart
router.post(
  "/",
  protect,
  createOrder
);

// Get logged-in customer's orders
router.get(
  "/",
  protect,
  getMyOrders
);

// Get one customer's order
router.get(
  "/:id",
  protect,
  getOrderById
);

module.exports = router;