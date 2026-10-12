import { useMemo, useState } from "react";
import "./MyOrders.css";

const API_URL = "https://enterprise-ecommerce-oct.onrender.com/api";

const filters = [
  { key: "ALL", label: "All Orders" },
  { key: "PENDING_PAYMENT", label: "To Pay" },
  { key: "PAID", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" }
];

const getStatusClass = (status) => {
  return String(status || "").toLowerCase().replace(/\s+/g, "-");
};



const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatDateTime = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function MyOrders({
  token,
  orders,
  loading,
  onRefresh,
  onPay
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      toPay: orders.filter(
        (order) => order.payment_status === "PENDING"
      ).length,
      processing: orders.filter(
        (order) => order.order_status === "PROCESSING"
      ).length,
      shipped: orders.filter(
        (order) => order.order_status === "SHIPPED"
      ).length,
      delivered: orders.filter(
        (order) => order.order_status === "DELIVERED"
      ).length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      let matchesFilter = true;

      if (activeFilter === "PENDING_PAYMENT") {
        matchesFilter = order.payment_status === "PENDING";
      } else if (activeFilter === "PAID") {
        matchesFilter = order.payment_status === "PAID";
      } else if (activeFilter !== "ALL") {
        matchesFilter = order.order_status === activeFilter;
      }

      if (!matchesFilter) return false;

      if (!query) return true;

      return (
        String(order.id).includes(query) ||
        String(order.payment_status || "")
          .toLowerCase()
          .includes(query) ||
        String(order.order_status || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [orders, activeFilter, search]);

  const openDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (orderDetails[orderId]) {
      return;
    }

    try {
      setDetailsLoading(true);

      const response = await fetch(
        `${API_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load order details"
        );
      }

      setOrderDetails((current) => ({
        ...current,
        [orderId]: data.order
      }));
    } catch (error) {
      console.error("Order details error:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getProgressStep = (status) => {
    const steps = [
      "PROCESSING",
      "SHIPPED",
      "DELIVERED"
    ];

    const index = steps.indexOf(status);

    if (status === "CANCELLED") return -1;

    return index;
  };

  return (
    <div className="my-orders-page">
      <section className="orders-hero">
        <div>
          <p className="orders-label">ACCOUNT</p>
          <h2>My Orders</h2>
          <p>
            Track your purchases, payments and delivery status.
          </p>
        </div>

        <button
          className="orders-refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </section>

      <section className="order-stats">
        <button
          className={`order-stat-card ${
            activeFilter === "ALL" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("ALL")}
        >
          <span className="order-stat-icon">📦</span>
          <span className="order-stat-label">All Orders</span>
          <strong>{counts.all}</strong>
        </button>

        <button
          className={`order-stat-card ${
            activeFilter === "PENDING_PAYMENT" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("PENDING_PAYMENT")}
        >
          <span className="order-stat-icon">💳</span>
          <span className="order-stat-label">To Pay</span>
          <strong>{counts.toPay}</strong>
        </button>

        <button
          className={`order-stat-card ${
            activeFilter === "PAID" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("PAID")}
        >
          <span className="order-stat-icon">✓</span>
          <span className="order-stat-label">Paid</span>
          <strong>
            {orders.filter(
              (order) => order.payment_status === "PAID"
            ).length}
          </strong>
        </button>

        <button
          className={`order-stat-card ${
            activeFilter === "PROCESSING" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("PROCESSING")}
        >
          <span className="order-stat-icon">⚙️</span>
          <span className="order-stat-label">Processing</span>
          <strong>{counts.processing}</strong>
        </button>

        <button
          className={`order-stat-card ${
            activeFilter === "DELIVERED" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("DELIVERED")}
        >
          <span className="order-stat-icon">✓</span>
          <span className="order-stat-label">Delivered</span>
          <strong>{counts.delivered}</strong>
        </button>
      </section>

      <section className="orders-toolbar">
        <div className="order-filter-tabs">
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={
                activeFilter === filter.key
                  ? "order-filter active"
                  : "order-filter"
              }
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="order-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
          />
        </div>
      </section>

      <div className="orders-result-header">
        <div>
          <h3>
            {activeFilter === "ALL"
              ? "Your Orders"
              : filters.find(
                  (item) => item.key === activeFilter
                )?.label}
          </h3>
          <span>
            {filteredOrders.length} order
            {filteredOrders.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>
            {search
              ? "Try another order number."
              : "Orders matching this section will appear here."}
          </p>
          <button
            onClick={() => {
              setActiveFilter("ALL");
              setSearch("");
            }}
          >
            View All Orders
          </button>
        </div>
      ) : (
        <section className="orders-list">
          {filteredOrders.map((order) => {
            const status = order.order_status;
            const payment = order.payment_status;
            const statusClass = getStatusClass(status);
            const currentStep = getProgressStep(status);
            const details = orderDetails[order.id];

            return (
              <article
                className={`customer-order-card ${statusClass}`}
                key={order.id}
              >
                <div className="order-card-header">
                  <div>
                    <p className="order-number">
                      ORDER #{order.id}
                    </p>
                    <p className="order-date">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="order-card-actions">
                    {payment === "PAID" ? (
                      <span className="payment-badge paid">
                        ✓ Payment Paid
                      </span>
                    ) : (
                      <span className="payment-badge pending">
                        Payment Pending
                      </span>
                    )}

                    <span
                      className={`order-status-badge ${statusClass}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                <div className="order-card-main">
                  <div className="order-main-info">
                    <p className="order-total-label">
                      Order Total
                    </p>
                    <strong className="order-total">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </strong>
                    <p className="order-payment-line">
                      Payment: <b>{payment}</b>
                    </p>
                  </div>

                  {status !== "CANCELLED" && (
                    <div className="order-progress">
                      <div className="progress-line" />

                      {[
                        ["PROCESSING", "Processing", "⚙️"],
                        ["SHIPPED", "Shipped", "🚚"],
                        ["DELIVERED", "Delivered", "✓"]
                      ].map(([key, label, icon], index) => (
                        <div
                          className={
                            index <= currentStep
                              ? "progress-step complete"
                              : "progress-step"
                          }
                          key={key}
                        >
                          <div className="progress-dot">
                            {icon}
                          </div>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {status === "CANCELLED" && (
                    <div className="cancelled-message">
                      <span>✕</span>
                      <div>
                        <strong>Order Cancelled</strong>
                        <p>
                          This order will not be delivered.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="order-actions">
                    {payment === "PENDING" && (
                      <button
                        className="pay-order-button"
                        onClick={() => onPay(order)}
                      >
                        💳 Pay Now
                      </button>
                    )}

                    <button
                      className="view-order-button"
                      onClick={() => openDetails(order.id)}
                    >
                      {expandedOrder === order.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details">
                    <div className="details-header">
                      <div>
                        <p>ORDER DETAILS</p>
                        <h4>
                          Order #{order.id}
                        </h4>
                      </div>

                      <span>
                        {formatDateTime(order.created_at)}
                      </span>
                    </div>

                    {detailsLoading && !details ? (
                      <div className="details-loading">
                        Loading order details...
                      </div>
                    ) : details ? (
                      <div className="details-content">
                        <div className="detail-items">
                          {details.items?.length ? (
                            details.items.map((item) => (
                              <div
                                className="detail-item"
                                key={item.product_id}
                              >
                                <div className="detail-item-image">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                    />
                                  ) : (
                                    <span>📦</span>
                                  )}
                                </div>

                                <div className="detail-item-info">
                                  <strong>{item.name}</strong>
                                  <span>
                                    Qty: {item.quantity}
                                  </span>
                                </div>

                                <strong>
                                  ₹
                                  {(
                                    Number(item.price) *
                                    Number(item.quantity)
                                  ).toFixed(2)}
                                </strong>
                              </div>
                            ))
                          ) : (
                            <p className="no-items">
                              No item details available.
                            </p>
                          )}
                        </div>

        <div className="detail-summary">

  <div>
    <span>Payment</span>
    <strong>{details.payment_status}</strong>
  </div>

  <div>
    <span>Order Status</span>
    <strong>{details.order_status}</strong>
  </div>

  <div>
    <span>Total</span>
    <strong>
      ₹
      {Number(
        details.total_amount
      ).toFixed(2)}
    </strong>
  </div>

</div>


{/* DELIVERY ADDRESS */}

{details.address && (
  <div className="delivery-address">

    <div className="delivery-address-header">
      <span className="delivery-address-icon">
        📍
      </span>

      <div>
        <p>DELIVERY ADDRESS</p>
        <h4>
          {details.address.full_name}
        </h4>
      </div>
    </div>


    <div className="delivery-address-content">

      <p>
        {details.address.address_line1}
      </p>

      {details.address.address_line2 && (
        <p>
          {details.address.address_line2}
        </p>
      )}

      <p>
        {details.address.city},{" "}
        {details.address.state}
        {details.address.postal_code
          ? ` - ${details.address.postal_code}`
          : ""}
      </p>

      {details.address.country && (
        <p>
          {details.address.country}
        </p>
      )}

      <p className="delivery-phone">
        📞 {details.address.phone}
      </p>

    </div>

  </div>
)}
                      </div>
                    ) : (
                      <div className="details-loading">
                        Unable to load details.
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default MyOrders;
