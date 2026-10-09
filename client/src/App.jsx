import { useEffect, useState } from "react";
import "./App.css";

import AdminDashboard from "./AdminDashboard";
import Shop from "./Shop";
import Cart from "./Cart";
import Checkout from "./Checkout";
import MyOrders from "./MyOrders";
import MyAccount from "./MyAccount";

const API_URL = "http://localhost:5000/api";

function App() {
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("Customer@12345");

  const [token, setToken] = useState(
    localStorage.getItem("customerToken") || ""
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerSection, setCustomerSection] = useState("shop");

  const [checkoutTotals, setCheckoutTotals] = useState(null);

  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  // =====================================================
  // LOAD CUSTOMER ORDERS
  // =====================================================

  const loadOrders = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // =====================================================
  // LOAD ORDERS AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (token && userRole === "customer") {
      loadOrders(token);
    }
  }, [token, userRole]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem(
        "customerToken",
        data.token
      );

      localStorage.setItem(
        "userRole",
        data.user.role
      );

      setToken(data.token);
      setUserRole(data.user.role);

      setCustomerSection(
        data.user.role === "admin"
          ? "dashboard"
          : "shop"
      );

      setMessage("Login successful!");

      if (data.user.role === "customer") {
        await loadOrders(data.token);
      }

    } catch (error) {
      console.error(error);
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  const createPayment = async (order) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: order.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to create payment"
        );
      }

      setSelectedOrder(order);
      setPaymentOrder(data.payment);

      setMessage(
        "Payment order created successfully."
      );

    } catch (error) {
      console.error(error);
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE PAYMENT
  // =====================================================

  const completePayment = async (
    status = "SUCCESS"
  ) => {
    if (!paymentOrder) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/payments/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: paymentOrder.order_id,
            payment_order_id:
              paymentOrder.payment_order_id,
            payment_status: status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Payment failed"
        );
      }

      setMessage(
        status === "SUCCESS"
          ? "Payment successful! Your order is now processing."
          : data.message || "Payment failed."
      );

      setPaymentOrder(null);
      setSelectedOrder(null);

      await loadOrders();

    } catch (error) {
      console.error(error);
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("userRole");

    setToken("");
    setUserRole("");

    setOrders([]);
    setSelectedOrder(null);
    setPaymentOrder(null);

    setCart([]);

    setMessage("");
  };

  // =====================================================
  // CART CHANGE
  // =====================================================

  const handleCartChange = (updatedCart) => {
    setCart(updatedCart);
  };

  // =====================================================
  // ADMIN
  // =====================================================

  if (token && userRole === "admin") {
    return <AdminDashboard token={token} />;
  }

  // =====================================================
  // CUSTOMER APPLICATION
  // =====================================================

  if (token && userRole === "customer") {
    return (
      <div className="customer-app">

        {/* ============================================
            SIDEBAR
        ============================================ */}

        <aside className="customer-sidebar">

          <div className="customer-brand">

            <div className="customer-brand-icon">
              🛍️
            </div>

            <div>
              <strong>Enterprise</strong>
              <span>Online Store</span>
            </div>

          </div>

          {/* CUSTOMER NAVIGATION */}

          <nav className="customer-nav">

            {/* SHOP */}

            <button
              className={
                customerSection === "shop"
                  ? "customer-nav-item active"
                  : "customer-nav-item"
              }
              onClick={() =>
                setCustomerSection("shop")
              }
            >
              🛍️ Shop
            </button>


            {/* MY ORDERS */}

            <button
              className={
                customerSection === "orders"
                  ? "customer-nav-item active"
                  : "customer-nav-item"
              }
              onClick={() => {
                setCustomerSection("orders");
                loadOrders();
              }}
            >
              📦 My Orders
            </button>


            {/* CART */}

            <button
              className={
                customerSection === "cart"
                  ? "customer-nav-item cart-nav active"
                  : "customer-nav-item cart-nav"
              }
              onClick={() =>
                setCustomerSection("cart")
              }
            >
              <span>🛒 Cart</span>

              <span>
                {cart.reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                )}
              </span>
            </button>


            {/* MY ACCOUNT */}

            <button
              className={
                customerSection === "account"
                  ? "customer-nav-item active"
                  : "customer-nav-item"
              }
              onClick={() =>
                setCustomerSection("account")
              }
            >
              👤 My Account
            </button>

          </nav>


          {/* LOGOUT */}

          <button
            className="customer-logout"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </aside>


        {/* ============================================
            MAIN CONTENT
        ============================================ */}

        <main className="customer-main">

          {/* ==========================================
              TOP HEADER
          ========================================== */}

          <header className="customer-topbar">

            <div>

              <span>
                ENTERPRISE E-COMMERCE
              </span>

              <h1>
                {customerSection === "shop"
                  ? "Shop"
                  : customerSection === "cart"
                  ? "Cart"
                  : customerSection === "checkout"
                  ? "Checkout"
                  : customerSection === "account"
                  ? "My Account"
                  : "My Orders"}
              </h1>

            </div>


            <div className="customer-top-actions">

              <button
                onClick={() =>
                  setCustomerSection("shop")
                }
              >
                🛍️ Shop
              </button>


              <button
                onClick={() =>
                  setCustomerSection("cart")
                }
              >
                🛒{" "}
                {cart.reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                )}
              </button>


              <button
                className="top-logout"
                onClick={logout}
              >
                Logout
              </button>

            </div>

          </header>


          {/* ==========================================
              SHOP
          ========================================== */}

          {customerSection === "shop" && (
            <Shop
              token={token}
              onCartChange={handleCartChange}
            />
          )}


          {/* ==========================================
              CART
          ========================================== */}

          {customerSection === "cart" && (
            <Cart
              cart={cart}
              onCartChange={handleCartChange}
              onContinueShopping={() =>
                setCustomerSection("shop")
              }
              onCheckout={(totals) => {
                setCheckoutTotals(totals);
                setCustomerSection("checkout");
                setMessage("");
              }}
            />
          )}


          {/* ==========================================
              CHECKOUT
          ========================================== */}

          {customerSection === "checkout" && (
            <Checkout
              token={token}
              totals={checkoutTotals}
              onBackToCart={() =>
                setCustomerSection("cart")
              }
              onOrderCreated={(order) => {

                // Clear cart
                localStorage.removeItem("cart");
                setCart([]);

                // Clear checkout totals
                setCheckoutTotals(null);

                // Go to orders
                setCustomerSection("orders");

                // Refresh orders
                loadOrders();

                setMessage(
                  `Order #${order.id} created successfully.`
                );

              }}
            />
          )}


          {/* ==========================================
              MY ORDERS
          ========================================== */}

          {customerSection === "orders" && (
            <MyOrders
              token={token}
              orders={orders}
              loading={loading}
              onRefresh={() =>
                loadOrders()
              }
              onPay={createPayment}
            />
          )}


          {/* ==========================================
              MY ACCOUNT
          ========================================== */}

          {customerSection === "account" && (
            <MyAccount
              token={token}
              onOrders={() => {
                setCustomerSection("orders");
                loadOrders();
              }}
            />
          )}


          {/* ==========================================
              PAYMENT PANEL
          ========================================== */}

          {paymentOrder && selectedOrder && (
            <div className="payment-panel">

              <div>

                <p>PAYMENT</p>

                <h2>
                  Complete Payment
                </h2>

                <span>
                  Order #{selectedOrder.id}
                </span>

              </div>


              <div className="payment-summary">

                <div>

                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      paymentOrder.amount
                    ).toFixed(2)}
                  </strong>

                </div>


                <div>

                  <span>
                    Gateway
                  </span>

                  <strong>
                    Mock Payment
                  </strong>

                </div>

              </div>


              <p>
                This is a simulated payment
                gateway for development and
                testing.
              </p>


              <div className="payment-actions">

                {/* SUCCESS PAYMENT */}

                <button
                  className="success-payment"
                  onClick={() =>
                    completePayment("SUCCESS")
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : `Pay ₹${Number(
                        paymentOrder.amount
                      ).toFixed(2)}`}
                </button>


                {/* FAILED PAYMENT */}

                <button
                  className="failed-payment"
                  onClick={() =>
                    completePayment("FAILED")
                  }
                  disabled={loading}
                >
                  Simulate Failed Payment
                </button>

              </div>

            </div>
          )}


          {/* ==========================================
              GLOBAL CUSTOMER MESSAGE
          ========================================== */}

          {message && (
            <div className="customer-message">

              <span>
                {message}
              </span>

              <button
                onClick={() =>
                  setMessage("")
                }
              >
                ×
              </button>

            </div>
          )}

        </main>

      </div>
    );
  }


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  
  return (
    <div className="login-screen">
      <section className="login-showcase">
        <div className="login-brand">
          <span className="login-brand-icon">✦</span>
          <span>Enterprise<span className="brand-highlight">.</span></span>
        </div>

        <div className="showcase-content">
          <span className="showcase-tag">YOUR NEXT FAVORITE FIND</span>
          <h1>
            Shopping made
            <br />
            <span>simple.</span>
          </h1>
          <p>
            Discover products you love, manage your orders,
            and enjoy a seamless shopping experience.
          </p>

          <div className="shopping-visual">
            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>
            <div className="shopping-bag">🛍️</div>
            <div className="floating-card floating-card-top">
              <span>✦</span> Your style, your choice
            </div>
            <div className="floating-card floating-card-bottom">
              <span>✓</span> Shopping made easy
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <span>SECURE SHOPPING</span>
          <span>•</span>
          <span>SMARTER LIVING</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="mobile-brand">
            ✦ Enterprise<span className="brand-highlight">.</span>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue shopping.</p>
          </div>

          <form className="premium-login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="login-input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              className="premium-login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to continue"}
              {!loading && <span>→</span>}
            </button>
          </form>

          {message && (
            <div className="premium-login-message" role="status">
              {message}
            </div>
          )}

          <div className="login-security-note">
            <span>♧</span>
            Your account and information are protected.
          </div>
        </div>

        <footer className="login-bottom-note">
          © 2026 Enterprise E-Commerce
        </footer>
      </section>
    </div>
  );

}

export default App;