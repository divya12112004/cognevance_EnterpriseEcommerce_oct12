const crypto = require("crypto");
const { pool } = require("../config/database");
const transporter = require("../config/email");

// CREATE MOCK PAYMENT ORDER
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    // Check order belongs to logged-in user
    const [orders] = await pool.query(
      `SELECT
        id,
        total_amount,
        payment_status,
        order_status
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [order_id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];

    if (order.payment_status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid"
      });
    }

    // Generate unique mock payment order ID
    const paymentOrderId =
      `MOCK_ORDER_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // Save payment order ID
    await pool.query(
      `UPDATE orders
       SET razorpay_order_id = ?
       WHERE id = ?`,
      [paymentOrderId, order_id]
    );

    // Create payment record
    await pool.query(
      `INSERT INTO payments
       (order_id, razorpay_order_id, amount, status)
       VALUES (?, ?, ?, 'CREATED')`,
      [
        order_id,
        paymentOrderId,
        order.total_amount
      ]
    );

    res.json({
      success: true,
      message: "Mock payment order created successfully",
      payment: {
        payment_order_id: paymentOrderId,
        order_id: order.id,
        amount: Number(order.total_amount),
        currency: "INR",
        gateway: "MOCK"
      }
    });

  } catch (error) {
    console.error("Create payment order error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating payment order"
    });
  }
};


// VERIFY MOCK PAYMENT
const verifyPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;

    const {
      order_id,
      payment_order_id,
      payment_status
    } = req.body;

    if (!order_id || !payment_order_id || !payment_status) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required"
      });
    }

    // Only allow SUCCESS or FAILED
    if (!["SUCCESS", "FAILED"].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    // Verify order belongs to logged-in user
    const [orders] = await connection.query(
      `SELECT
        id,
        total_amount,
        razorpay_order_id,
        payment_status
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [order_id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];

    // Verify payment order ID
    if (order.razorpay_order_id !== payment_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order mismatch"
      });
    }

    await connection.beginTransaction();

    // =========================
    // SUCCESSFUL PAYMENT
    // =========================
    if (payment_status === "SUCCESS") {

      // Update payment
      await connection.query(
        `UPDATE payments
         SET status = 'SUCCESS'
         WHERE order_id = ?
         AND razorpay_order_id = ?
         AND status = 'CREATED'`,
        [
          order_id,
          payment_order_id
        ]
      );

      // Update order
      await connection.query(
        `UPDATE orders
         SET payment_status = 'PAID',
             order_status = 'PROCESSING'
         WHERE id = ?`,
        [order_id]
      );

      await connection.commit();

      // Get customer email
      const [users] = await pool.query(
        `SELECT name, email
         FROM users
         WHERE id = ?`,
        [userId]
      );

      const customer = users[0];

      // Send payment confirmation email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: "Payment Successful - Enterprise E-Commerce",
        html: `
          <div style="font-family: Arial, sans-serif;">
            
            <h2>Payment Successful 🎉</h2>

            <p>Hello ${customer.name},</p>

            <p>
              Your payment has been successfully completed.
            </p>

            <p>
              <strong>Order ID:</strong> ${order_id}
            </p>

            <p>
              <strong>Amount:</strong>
              ₹${Number(order.total_amount).toFixed(2)}
            </p>

            <p>
              <strong>Payment Status:</strong> PAID
            </p>

            <p>
              <strong>Order Status:</strong> PROCESSING
            </p>

            <p>
              Thank you for shopping with us!
            </p>

            <p>
              Regards,<br>
              Enterprise E-Commerce Team
            </p>

          </div>
        `
      });

      return res.json({
        success: true,
        message: "Payment successful and confirmation email sent",
        order: {
          id: order_id,
          payment_status: "PAID",
          order_status: "PROCESSING"
        }
      });
    }


    // =========================
    // FAILED PAYMENT
    // =========================

    await connection.query(
      `UPDATE payments
       SET status = 'FAILED'
       WHERE order_id = ?
       AND razorpay_order_id = ?
       AND status = 'CREATED'`,
      [
        order_id,
        payment_order_id
      ]
    );

    await connection.commit();

    return res.json({
      success: false,
      message: "Payment failed",
      order: {
        id: order_id,
        payment_status: "PENDING",
        order_status: "PENDING"
      }
    });

  } catch (error) {

    await connection.rollback();

    console.error("Payment verification error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while processing payment"
    });

  } finally {
    connection.release();
  }
};


module.exports = {
  createPaymentOrder,
  verifyPayment
};