const { pool } = require("../config/database");

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      discount,
      stock,
      image_url
    } = req.body;

    // Required fields
    if (
      !name ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, price and stock are required"
      });
    }

    // Validate price
    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative"
      });
    }

    // Validate stock
    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative"
      });
    }

    // Validate discount
    if (
      Number(discount || 0) < 0 ||
      Number(discount || 0) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100"
      });
    }

    // Validate category
    if (category_id) {
      const [categories] = await pool.query(
        `SELECT id
         FROM categories
         WHERE id = ?`,
        [category_id]
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected category does not exist"
        });
      }
    }

    // Create product
    const [result] = await pool.query(
      `INSERT INTO products
      (
        category_id,
        name,
        description,
        price,
        discount,
        stock,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        name.trim(),
        description?.trim() || null,
        Number(price),
        Number(discount || 0),
        Number(stock),
        image_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: result.insertId
    });

  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while creating product"
    });
  }
};


// =====================================================
// GET PRODUCTS
// SEARCH + PAGINATION
// =====================================================

const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      stock = "",
      sort = "newest"
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
      limit = 10;
    }

    if (limit > 100) {
      limit = 100;
    }

    search = search.trim();

    const offset = (page - 1) * limit;

    // ==========================================
    // FILTER CONDITIONS
    // ==========================================

    let conditions = ["p.is_active = TRUE"];
    let queryParams = [];

    // Search
    if (search) {
      conditions.push(`
        (
          p.name LIKE ?
          OR p.description LIKE ?
          OR c.name LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      queryParams.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Category filter
    if (category) {
      conditions.push("p.category_id = ?");
      queryParams.push(Number(category));
    }

    // Stock filter
    if (stock === "in") {
      conditions.push("p.stock > 10");
    }

    if (stock === "low") {
      conditions.push("p.stock > 0 AND p.stock <= 10");
    }

    if (stock === "out") {
      conditions.push("p.stock = 0");
    }

    const whereClause = conditions.join(" AND ");

    // ==========================================
    // SORTING
    // ==========================================

    let orderBy = "p.created_at DESC";

    if (sort === "name_asc") {
      orderBy = "p.name ASC";
    }

    if (sort === "price_asc") {
      orderBy = "p.price ASC";
    }

    if (sort === "price_desc") {
      orderBy = "p.price DESC";
    }

    if (sort === "stock_asc") {
      orderBy = "p.stock ASC";
    }

    // ==========================================
    // COUNT PRODUCTS
    // ==========================================

    const [countResult] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE ${whereClause}
      `,
      queryParams
    );

    const totalProducts = Number(
      countResult[0].total
    );

    // ==========================================
    // FETCH PRODUCTS
    // ==========================================

    const [products] = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [
        ...queryParams,
        limit,
        offset
      ]
    );

    const totalPages =
      Math.ceil(totalProducts / limit);

    res.json({
      success: true,

      products,

      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1
      }
    });

  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching products"
    });
  }
};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT
        p.*,
        c.name AS category_name
       FROM products p
       LEFT JOIN categories c
         ON p.category_id = c.id
       WHERE p.id = ?
       AND p.is_active = TRUE`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product: products[0]
    });

  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching product"
    });
  }
};


// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      name,
      description,
      price,
      discount,
      stock,
      image_url,
      is_active
    } = req.body;

    const [result] = await pool.query(
      `UPDATE products
       SET category_id = ?,
           name = ?,
           description = ?,
           price = ?,
           discount = ?,
           stock = ?,
           image_url = ?,
           is_active = ?
       WHERE id = ?`,
      [
        category_id || null,
        name,
        description || null,
        price,
        discount || 0,
        stock,
        image_url || null,
        is_active !== undefined
          ? is_active
          : true,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message:
        "Product updated successfully"
    });

  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating product"
    });
  }
};


// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE products
       SET is_active = FALSE
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message:
        "Product deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting product"
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};