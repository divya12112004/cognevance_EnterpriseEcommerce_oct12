const express = require("express");

const {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's addresses
router.get("/", protect, getMyAddresses);

// Add address
router.post("/", protect, createAddress);

// Update address
router.put("/:id", protect, updateAddress);

// Delete address
router.delete("/:id", protect, deleteAddress);

module.exports = router;