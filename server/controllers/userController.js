const { pool } = require("../config/database");

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT
        id,
        name,
        email,
        role,
        created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error("Get all customers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching customers"
    });
  }
};

module.exports = {
  getAllCustomers
};