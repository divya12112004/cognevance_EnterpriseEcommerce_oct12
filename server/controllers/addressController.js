const { pool } = require("../config/database");

// ===============================
// GET MY ADDRESSES
// ===============================
const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [addresses] = await pool.query(
      `SELECT
        id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default,
        created_at
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      addresses
    });

  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching addresses"
    });
  }
};


// ===============================
// ADD ADDRESS
// ===============================
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default
    } = req.body;

    // Required fields
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields"
      });
    }

    // If this address is default,
    // remove default from existing addresses
    if (is_default) {
      await pool.query(
        `UPDATE addresses
         SET is_default = FALSE
         WHERE user_id = ?`,
        [userId]
      );
    }

    const [result] = await pool.query(
      `INSERT INTO addresses
      (
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        full_name.trim(),
        phone.trim(),
        address_line1.trim(),
        address_line2?.trim() || null,
        city.trim(),
        state.trim(),
        postal_code.trim(),
        country.trim(),
        is_default ? true : false
      ]
    );

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addressId: result.insertId
    });

  } catch (error) {
    console.error("Create address error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding address"
    });
  }
};


// ===============================
// UPDATE ADDRESS
// ===============================
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default
    } = req.body;

    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields"
      });
    }

    // Check ownership
    const [existing] = await pool.query(
      `SELECT id
       FROM addresses
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Remove default from other addresses
    if (is_default) {
      await pool.query(
        `UPDATE addresses
         SET is_default = FALSE
         WHERE user_id = ? AND id != ?`,
        [userId, id]
      );
    }

    await pool.query(
      `UPDATE addresses
       SET
        full_name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        is_default = ?
       WHERE id = ?
       AND user_id = ?`,
      [
        full_name.trim(),
        phone.trim(),
        address_line1.trim(),
        address_line2?.trim() || null,
        city.trim(),
        state.trim(),
        postal_code.trim(),
        country.trim(),
        is_default ? true : false,
        id,
        userId
      ]
    );

    res.json({
      success: true,
      message: "Address updated successfully"
    });

  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating address"
    });
  }
};


// ===============================
// DELETE ADDRESS
// ===============================
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM addresses
       WHERE id = ?
       AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting address"
    });
  }
};


module.exports = {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};