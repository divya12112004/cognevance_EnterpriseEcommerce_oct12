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

/* VERIFY MOCK PAYMENT */
const verifyPayment = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();

    const userId = req.user.id;
    const {
      order_id,
      payment_order_id,
      payment_status
    } = req.body;

    // Validate request
    if (!order_id || !payment_order_id || !payment_status) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required"
      });
    }

    if (!["SUCCESS", "FAILED"].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    // Verify that the order belongs to this user
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

    // Make repeated successful requests safe
    if (
      payment_status === "SUCCESS" &&
      order.payment_status === "PAID"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment has already been completed",
        order: {
          id: order_id,
          payment_status: "PAID",
          order_status: "PROCESSING"
        }
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    if (payment_status === "SUCCESS") {
      // Mark the mock payment as successful
      const [paymentResult] = await connection.query(
        `UPDATE payments
         SET status = 'SUCCESS'
         WHERE order_id = ?
           AND razorpay_order_id = ?
           AND status = 'CREATED'`,
        [order_id, payment_order_id]
      );

      // Check whether a matching payment record exists
      if (paymentResult.affectedRows === 0) {
        const [payments] = await connection.query(
          `SELECT status
           FROM payments
           WHERE order_id = ?
             AND razorpay_order_id = ?`,
          [order_id, payment_order_id]
        );

        if (
          payments.length === 0 ||
          payments[0].status !== "SUCCESS"
        ) {
          await connection.rollback();
          transactionStarted = false;

          return res.status(400).json({
            success: false,
            message: "Valid pending payment record not found"
          });
        }
      }

      // Update order status
      await connection.query(
        `UPDATE orders
         SET payment_status = 'PAID',
             order_status = 'PROCESSING'
         WHERE id = ? AND user_id = ?`,
        [order_id, userId]
      );

      // Commit payment before attempting email delivery
      await connection.commit();
      transactionStarted = false;

      // Respond without waiting for Gmail
      res.status(200).json({
        success: true,
        message: "Payment successful! Your order is processing.",
        order: {
          id: order_id,
          payment_status: "PAID",
          order_status: "PROCESSING"
        }
      });

      // Send confirmation email separately
      // Email failures must not reverse a successful payment.
      (async () => {
        const [users] = await pool.query(
          `SELECT name, email
           FROM users
           WHERE id = ?`,
          [userId]
        );

        const customer = users[0];

        if (!customer || !customer.email) {
          throw new Error("Customer email not found");
        }

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject: "Payment Successful - Enterprise E-Commerce",
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Payment Successful</h2>
              <p>Hello ${customer.name},</p>
              <p>Your mock payment has been completed successfully.</p>
              <p><strong>Order ID:</strong> ${order_id}</p>
              <p><strong>Amount:</strong>
                ₹${Number(order.total_amount).toFixed(2)}
              </p>
              <p><strong>Payment Status:</strong> PAID</p>
              <p><strong>Order Status:</strong> PROCESSING</p>
              <p>Thank you for shopping with us!</p>
              <p>Enterprise E-Commerce Team</p>
            </div>
          `
        });

        console.log(
          `Payment confirmation email sent for order ${order_id}`
        );
      })().catch((emailError) => {
        console.error(
          `Payment email failed for order ${order_id}:`,
          emailError.message
        );
      });

      return;
    }

    // Handle failed mock payment
    await connection.query(
      `UPDATE payments
       SET status = 'FAILED'
       WHERE order_id = ?
         AND razorpay_order_id = ?
         AND status = 'CREATED'`,
      [order_id, payment_order_id]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: false,
      message: "Payment failed. Please try again.",
      order: {
        id: order_id,
        payment_status: "PENDING",
        order_status: "PENDING"
      }
    });

  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Payment rollback failed:",
          rollbackError.message
        );
      }
    }

    console.error("Payment verification error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Server error while processing payment"
      });
    }

  } finally {
    if (connection) {
      connection.release();
    }
  }
};



module.exports = {
  createPaymentOrder,
  verifyPayment
};