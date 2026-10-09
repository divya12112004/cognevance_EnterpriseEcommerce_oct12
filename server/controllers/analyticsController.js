const { pool } = require("../config/database");

// GET ADMIN ANALYTICS
const getAnalytics = async (req, res) => {
  try {

    // Total users
    const [users] = await pool.query(
      `SELECT COUNT(*) AS total_users
       FROM users`
    );

    // Total products
    const [products] = await pool.query(
      `SELECT COUNT(*) AS total_products
       FROM products
       WHERE is_active = TRUE`
    );

    // Total orders
    const [orders] = await pool.query(
      `SELECT COUNT(*) AS total_orders
       FROM orders`
    );

    // Total revenue from paid orders
    const [revenue] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM orders
       WHERE payment_status = 'PAID'`
    );

    // Pending orders
    const [pendingOrders] = await pool.query(
      `SELECT COUNT(*) AS pending_orders
       FROM orders
       WHERE payment_status = 'PENDING'`
    );

    // Processing orders
    const [processingOrders] = await pool.query(
      `SELECT COUNT(*) AS processing_orders
       FROM orders
       WHERE order_status = 'PROCESSING'`
    );

    // Delivered orders
    const [deliveredOrders] = await pool.query(
      `SELECT COUNT(*) AS delivered_orders
       FROM orders
       WHERE order_status = 'DELIVERED'`
    );

    // Cancelled orders
    const [cancelledOrders] = await pool.query(
      `SELECT COUNT(*) AS cancelled_orders
       FROM orders
       WHERE order_status = 'CANCELLED'`
    );

    // Return analytics
    res.json({
      success: true,
      analytics: {
        total_users: users[0].total_users,
        total_products: products[0].total_products,
        total_orders: orders[0].total_orders,
        total_revenue: Number(revenue[0].total_revenue),
        pending_orders: pendingOrders[0].pending_orders,
        processing_orders: processingOrders[0].processing_orders,
        delivered_orders: deliveredOrders[0].delivered_orders,
        cancelled_orders: cancelledOrders[0].cancelled_orders
      }
    });

  } catch (error) {

    console.error("Analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics"
    });
  }
};

// GET SALES ANALYTICS - LAST 7 DAYS
const getSalesAnalytics = async (req, res) => {
  try {

    const [sales] = await pool.query(
      `SELECT
        DATE(created_at) AS sale_date,
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE payment_status = 'PAID'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at)
       ORDER BY sale_date ASC`
    );

    res.json({
      success: true,
      sales: sales.map((item) => ({
        date: item.sale_date,
        orders: Number(item.total_orders),
        revenue: Number(item.revenue)
      }))
    });

  } catch (error) {

    console.error("Sales analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching sales analytics"
    });
  }
};

// GET PRODUCT & CATEGORY ANALYTICS
const getProductAnalytics = async (req, res) => {
  try {

    // TOP SELLING PRODUCTS
    const [products] = await pool.query(
      `SELECT
        p.id,
        p.name,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.payment_status = 'PAID'
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 5`
    );


    // CATEGORY-WISE SALES
    const [categories] = await pool.query(
      `SELECT
        c.name AS category,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE o.payment_status = 'PAID'
       GROUP BY c.id, c.name
       ORDER BY revenue DESC`
    );


    res.json({
      success: true,

      products: products.map((item) => ({
        id: item.id,
        name: item.name,
        units_sold: Number(item.units_sold),
        revenue: Number(item.revenue)
      })),

      categories: categories.map((item) => ({
        category: item.category,
        units_sold: Number(item.units_sold),
        revenue: Number(item.revenue)
      }))
    });

  } catch (error) {

    console.error(
      "Product analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching product analytics"
    });
  }
};

// GET CUSTOMER & RECENT ORDER ANALYTICS
const getCustomerAnalytics = async (req, res) => {
  try {

    // TOP CUSTOMERS
    const [customers] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(
          CASE
            WHEN o.payment_status = 'PAID'
            THEN o.total_amount
            ELSE 0
          END
        ), 0) AS total_spent
       FROM users u
       LEFT JOIN orders o
         ON u.id = o.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email
       ORDER BY total_spent DESC
       LIMIT 5`
    );


    // RECENT ORDERS
    const [orders] = await pool.query(
      `SELECT
        o.id,
        u.name AS customer_name,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.created_at
       FROM orders o
       JOIN users u
         ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );


    res.json({
      success: true,

      customers: customers.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        total_orders: Number(item.total_orders),
        total_spent: Number(item.total_spent)
      })),

      orders: orders.map((item) => ({
        id: item.id,
        customer_name: item.customer_name,
        total_amount: Number(item.total_amount),
        payment_status: item.payment_status,
        order_status: item.order_status,
        created_at: item.created_at
      }))
    });

  } catch (error) {

    console.error(
      "Customer analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching customer analytics"
    });
  }
};

// GET INVENTORY ANALYTICS
const getInventoryAnalytics = async (req, res) => {
  try {

    const [inventory] = await pool.query(
      `SELECT
        p.id,
        p.name,
        p.stock,
        p.price,
        c.name AS category
       FROM products p
       LEFT JOIN categories c
         ON p.category_id = c.id
       WHERE p.is_active = TRUE
       ORDER BY p.stock ASC`
    );

    const lowStock = inventory.filter(
      (product) => product.stock > 0 && product.stock <= 10
    );

    const outOfStock = inventory.filter(
      (product) => product.stock === 0
    );

    res.json({
      success: true,

      inventory: inventory.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: Number(item.stock),
        price: Number(item.price)
      })),

      low_stock: lowStock.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: Number(item.stock)
      })),

      out_of_stock: outOfStock.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: Number(item.stock)
      }))
    });

  } catch (error) {

    console.error(
      "Inventory analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching inventory analytics"
    });
  }
};



module.exports = {
  getAnalytics,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics
};