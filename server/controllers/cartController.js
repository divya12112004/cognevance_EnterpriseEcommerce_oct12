const { pool } = require("../config/database");

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product ID and valid quantity are required"
      });
    }

    // Check product
    const [products] = await pool.query(
      `SELECT id, price, stock
       FROM products
       WHERE id = ? AND is_active = TRUE`,
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const product = products[0];

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock"
      });
    }

    // Find user's cart
    let [carts] = await pool.query(
      "SELECT id FROM cart WHERE user_id = ?",
      [userId]
    );

    let cartId;

    if (carts.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO cart (user_id) VALUES (?)",
        [userId]
      );

      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Check if product already exists
    const [existingItems] = await pool.query(
      `SELECT id, quantity
       FROM cart_items
       WHERE cart_id = ? AND product_id = ?`,
      [cartId, product_id]
    );

    if (existingItems.length > 0) {
      const newQuantity =
        existingItems[0].quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Total quantity exceeds available stock"
        });
      }

      await pool.query(
        `UPDATE cart_items
         SET quantity = ?
         WHERE id = ?`,
        [newQuantity, existingItems[0].id]
      );

    } else {
      await pool.query(
        `INSERT INTO cart_items
         (cart_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [cartId, product_id, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: "Product added to cart"
    });

  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding product to cart"
    });
  }
};


// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartRows] = await pool.query(
      "SELECT id FROM cart WHERE user_id = ?",
      [userId]
    );

    if (cartRows.length === 0) {
      return res.json({
        success: true,
        cart: {
          items: [],
          total: 0
        }
      });
    }

    const cartId = cartRows[0].id;

   const [items] = await pool.query(
  `SELECT
    ci.id,
    ci.product_id,
    ci.quantity,
    p.name,
    p.price,
    p.discount,
    p.stock,
    p.image_url,
    p.category_id,
    c.name AS category_name,
    (p.price * ci.quantity) AS subtotal
   FROM cart_items ci
   JOIN products p
     ON ci.product_id = p.id
   LEFT JOIN categories c
     ON p.category_id = c.id
   WHERE ci.cart_id = ?`,
  [cartId]
);

    const total = items.reduce(
      (sum, item) => {
        const discountedPrice =
          Number(item.price) *
          (1 - Number(item.discount || 0) / 100);

        return sum + discountedPrice * item.quantity;
      },
      0
    );

    res.json({
      success: true,
      cart: {
        items,
        total: Number(total.toFixed(2))
      }
    });

  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching cart"
    });
  }
};


// UPDATE CART ITEM
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    const [items] = await pool.query(
      `SELECT ci.id, p.stock
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    if (quantity > items[0].stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity exceeds available stock"
      });
    }

    await pool.query(
      `UPDATE cart_items
       SET quantity = ?
       WHERE id = ?`,
      [quantity, itemId]
    );

    res.json({
      success: true,
      message: "Cart item updated successfully"
    });

  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating cart"
    });
  }
};


// REMOVE CART ITEM
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const [result] = await pool.query(
      `DELETE ci
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.json({
      success: true,
      message: "Product removed from cart"
    });

  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while removing cart item"
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart
};