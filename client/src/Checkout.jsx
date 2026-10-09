import { useEffect, useState } from "react";
import "./Checkout.css";

const API_URL = "http://localhost:5000/api";

function Checkout({ token, totals, onOrderCreated, onBackToCart }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India"
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load addresses");
      const list = data.addresses || [];
      setAddresses(list);
      if (list.length && !selectedAddressId) {
        setSelectedAddressId(String(list[0].id));
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAddresses();
  }, [token]);

  const changeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const response = await fetch(`${API_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save address");

      await loadAddresses();
      setSelectedAddressId(String(data.addressId));
      setShowForm(false);
      setForm({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India"
      });
      setMessage("Address added successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setMessage("Please select a delivery address.");
      return;
    }

    try {
      setPlacing(true);
      setMessage("");
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ address_id: Number(selectedAddressId) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create order");

      localStorage.removeItem("cart");
      setMessage("Order created successfully.");

      if (onOrderCreated) onOrderCreated(data.order);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setPlacing(false);
    }
  };

  const selectedAddress = addresses.find(
    (item) => String(item.id) === String(selectedAddressId)
  );

  return (
    <div className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-label">CHECKOUT</p>
          <h2>Complete Your Order</h2>
          <p>Review your delivery address and order before placing it.</p>
        </div>
        <button className="back-cart-button" onClick={onBackToCart} type="button">
          ← Back to Cart
        </button>
      </div>

      {message && (
        <div className="checkout-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")} type="button">×</button>
        </div>
      )}

      <div className="checkout-layout">
        <section className="address-section">
          <div className="checkout-section-header">
            <div>
              <p className="checkout-mini-label">DELIVERY</p>
              <h3>Delivery Address</h3>
              <p>Select where you want your order delivered.</p>
            </div>
            <button
              className="add-address-button"
              type="button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close" : "+ Add New Address"}
            </button>
          </div>

          {showForm && (
            <form className="address-form" onSubmit={saveAddress}>
              <div className="address-form-grid">
                {[
                  ["full_name", "Full Name", "Enter full name"],
                  ["phone", "Phone", "Enter phone number"],
                  ["address_line1", "Address Line 1", "House / Door No, Street"],
                  ["address_line2", "Address Line 2", "Apartment, landmark, area"],
                  ["city", "City", "City"],
                  ["state", "State", "State"],
                  ["postal_code", "Postal Code", "Postal code"],
                  ["country", "Country", "Country"]
                ].map(([name, label, placeholder]) => (
                  <div
                    className={`address-field ${name === "address_line1" || name === "address_line2" ? "address-field-full" : ""}`}
                    key={name}
                  >
                    <label>{label}{name !== "address_line2" ? " *" : ""}</label>
                    <input
                      name={name}
                      value={form[name]}
                      onChange={changeForm}
                      placeholder={placeholder}
                      required={name !== "address_line2"}
                    />
                  </div>
                ))}
              </div>
              <button className="save-address-button" type="submit" disabled={saving}>
                {saving ? "Saving Address..." : "Save Address"}
              </button>
            </form>
          )}

          {loading ? (
            <div className="address-state"><div className="address-spinner" /><p>Loading saved addresses...</p></div>
          ) : addresses.length === 0 ? (
            <div className="address-empty">
              <div className="address-empty-icon">📍</div>
              <h4>No saved address</h4>
              <p>Add a delivery address before placing your order.</p>
              {!showForm && (
                <button type="button" onClick={() => setShowForm(true)}>+ Add Your Address</button>
              )}
            </div>
          ) : (
            <div className="address-list">
              {addresses.map((address) => {
                const selected = String(selectedAddressId) === String(address.id);
                return (
                  <button
                    type="button"
                    key={address.id}
                    className={`address-card ${selected ? "selected" : ""}`}
                    onClick={() => setSelectedAddressId(String(address.id))}
                  >
                    <div className="address-card-top">
                      <div className="address-person">
                        <span className="address-icon">📍</span>
                        <div>
                          <strong>{address.full_name}</strong>
                          <span>{address.phone}</span>
                        </div>
                      </div>
                      <span className="address-radio">{selected ? "✓" : ""}</span>
                    </div>
                    <div className="address-text">
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.state} - {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                    {selected && <span className="selected-address-label">✓ Selected for delivery</span>}
                  </button>
                );
              })}
            </div>
          )}

          {selectedAddress && !loading && (
            <div className="selected-address-note">
              📦 Your order will be delivered to <strong>{selectedAddress.full_name}</strong>.
            </div>
          )}
        </section>

        <aside className="checkout-summary">
          <p className="checkout-mini-label">ORDER SUMMARY</p>
          <h3>Your Order</h3>
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <strong>₹{Number(totals?.subtotal || 0).toFixed(2)}</strong>
          </div>
          <div className="checkout-summary-row checkout-discount">
            <span>Discount</span>
            <strong>- ₹{Number(totals?.discount || 0).toFixed(2)}</strong>
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{Number(totals?.total || 0).toFixed(2)}</strong>
          </div>
          <button
            className="place-order-button"
            type="button"
            onClick={placeOrder}
            disabled={placing || !selectedAddressId || loading}
          >
            {placing ? "Creating Order..." : "📦 Place Order"}
          </button>
          <p className="checkout-secure">🔒 Secure order processing</p>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
