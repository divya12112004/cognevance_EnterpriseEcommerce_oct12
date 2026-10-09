const express = require("express");

const {
  getAnalytics,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics
} = require("../controllers/analyticsController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  adminOnly,
  getAnalytics
);

router.get(
  "/sales",
  protect,
  adminOnly,
  getSalesAnalytics
);

router.get(
  "/products",
  protect,
  adminOnly,
  getProductAnalytics
);

router.get(
  "/customers",
  protect,
  adminOnly,
  getCustomerAnalytics
);

router.get(
  "/inventory",
  protect,
  adminOnly,
  getInventoryAnalytics
);

module.exports = router;