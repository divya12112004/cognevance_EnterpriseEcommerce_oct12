const express = require("express");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const {
  getAllCustomers
} = require("../controllers/userController");

const router = express.Router();

// ===============================
// LOGGED-IN USER
// ===============================

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "You can access your profile",
    user: req.user
  });
});

// ===============================
// ADMIN TEST
// ===============================

router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the admin area",
    user: req.user
  });
});

// ===============================
// CUSTOMER MANAGEMENT
// ===============================

// Get all customers - Admin only
router.get(
  "/admin/customers",
  protect,
  adminOnly,
  getAllCustomers
);

module.exports = router;