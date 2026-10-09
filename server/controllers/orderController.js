const { pool } = require("../config/database");

// ==========================================
// CREATE ORDER FROM CART
// ==========================================

const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required"
      });
    }

    await connection.beginTransaction();

    // Get user's cart
    const [carts] = await connection.query(
      "SELECT id FROM cart WHERE user_id = ?",
      [userId]
    );

    if (carts.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const cartId = carts[0].id;

    // Get cart items and product details
    const [items] = await connection.query(
      `SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.discount,
        p.stock
       FROM cart_items ci
       JOIN products p
         ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Check stock
    for (const item of items) {
      if (item.quantity > item.stock) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`
        });
      }
    }

    // Calculate total
    let totalAmount = 0;

    for (const item of items) {
      const discountedPrice =
        Number(item.price) *
        (1 - Number(item.discount || 0) / 100);

      totalAmount +=
        discountedPrice * item.quantity;
    }

    totalAmount = Number(
      totalAmount.toFixed(2)
    );

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (
         user_id,
         address_id,
         total_amount,
         payment_status,
         order_status
       )
       VALUES (?, ?, ?, 'PENDING', 'PENDING')`,
      [
        userId,
        address_id,
        totalAmount
      ]
    );

    const orderId =
      orderResult.insertId;

    // Create order items
    for (const item of items) {

      await connection.query(
        `INSERT INTO order_items
         (
           order_id,
           product_id,
           quantity,
           price
         )
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.quantity,
          item.price
        ]
      );

      // Reduce stock
      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [
          item.quantity,
          item.product_id
        ]
      );
    }

    // Clear cart
    await connection.query(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cartId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: orderId,
        total_amount: totalAmount,
        payment_status: "PENDING",
        order_status: "PENDING"
      }
    });

  } catch (error) {

    await connection.rollback();

    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating order"
    });

  } finally {
    connection.release();
  }
};


// ==========================================
// GET MY ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {

    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT
        id,
        total_amount,
        payment_status,
        order_status,
        created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching orders"
    });
  }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get order + delivery address
    const [orders] = await pool.query(
      `SELECT
        o.id,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.created_at,

        a.id AS address_id,
        a.full_name,
        a.phone,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.postal_code,
        a.country

       FROM orders o

       LEFT JOIN addresses a
         ON o.address_id = a.id

       WHERE o.id = ?
       AND o.user_id = ?`,
      [
        id,
        userId
      ]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get products in the order
    const [items] = await pool.query(
      `SELECT
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name,
        p.image_url
       FROM order_items oi
       JOIN products p
         ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const order = orders[0];

    res.json({
      success: true,

      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,

        // Delivery address
        address: order.address_id
          ? {
              id: order.address_id,
              full_name: order.full_name,
              phone: order.phone,
              address_line1: order.address_line1,
              address_line2: order.address_line2,
              city: order.city,
              state: order.state,
              postal_code: order.postal_code,
              country: order.country
            }
          : null,

        // Ordered products
        items
      }
    });

  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching order"
    });
  }
};

// ==========================================
// ADMIN - GET ALL ORDERS
// ==========================================

const getAllOrders = async (req, res) => {
  try {

    const [orders] = await pool.query(
      `SELECT
        o.id,
        o.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.created_at
       FROM orders o
       JOIN users u
         ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.error(
      "Get all orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching all orders"
    });
  }
};


// ==========================================
// ADMIN - UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!order_status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required"
      });
    }

    if (
      !allowedStatuses.includes(
        order_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const [orders] = await pool.query(
      `SELECT
        id,
        payment_status,
        order_status
       FROM orders
       WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];

    // Prevent shipping or delivering unpaid orders
    if (
      ["SHIPPED", "DELIVERED"].includes(
        order_status
      ) &&
      order.payment_status !== "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order must be paid before it can be shipped or delivered"
      });
    }

    await pool.query(
      `UPDATE orders
       SET order_status = ?
       WHERE id = ?`,
      [
        order_status,
        id
      ]
    );

    res.json({
      success: true,
      message:
        "Order status updated successfully",
      order: {
        id: Number(id),
        order_status
      }
    });

  } catch (error) {

    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating order status"
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};