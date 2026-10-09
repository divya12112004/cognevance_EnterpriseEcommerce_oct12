const { pool } = require("../config/database");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)`,
      [name, description || null]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      categoryId: result.insertId
    });

  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating category"
    });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT *
       FROM categories
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching categories"
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const [result] = await pool.query(
      `UPDATE categories
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully"
    });

  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating category"
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Category cannot be deleted because products may be using it"
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};