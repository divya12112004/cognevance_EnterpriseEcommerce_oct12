import { useEffect, useState } from "react";
import "./MyAccount.css";

const API_URL = "https://enterprise-ecommerce-oct.onrender.com/api";

function MyAccount({ token, onOrders }) {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false
  });

  // ===============================
  // LOAD PROFILE
  // ===============================

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load profile"
        );
      }

      setProfile(data.user);

    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };


  // ===============================
  // LOAD ADDRESSES
  // ===============================

  const loadAddresses = async () => {
    try {
      const response = await fetch(
        `${API_URL}/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load addresses"
        );
      }

      setAddresses(data.addresses || []);

    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };


  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(() => {
    const loadAccount = async () => {
      setLoading(true);

      await Promise.all([
        loadProfile(),
        loadAddresses()
      ]);

      setLoading(false);
    };

    if (token) {
      loadAccount();
    }
  }, [token]);


  // ===============================
  // FORM CHANGE
  // ===============================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };


  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setForm({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false
    });

    setEditingId(null);
    setShowForm(false);
  };


  // ===============================
  // EDIT ADDRESS
  // ===============================

  const handleEdit = (address) => {
    setForm({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: Boolean(address.is_default)
    });

    setEditingId(address.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // ===============================
  // SAVE ADDRESS
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAddressLoading(true);
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/addresses/${editingId}`
        : `${API_URL}/addresses`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save address"
        );
      }

      setMessage(
        editingId
          ? "Address updated successfully."
          : "Address added successfully."
      );

      resetForm();
      await loadAddresses();

    } catch (error) {
      console.error(error);
      setMessage(error.message);

    } finally {
      setAddressLoading(false);
    }
  };


  // ===============================
  // DELETE ADDRESS
  // ===============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    setAddressLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete address"
        );
      }

      setMessage("Address deleted successfully.");

      await loadAddresses();

    } catch (error) {
      console.error(error);
      setMessage(error.message);

    } finally {
      setAddressLoading(false);
    }
  };


  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-loading">
          <div className="account-spinner"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="account-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <section className="account-header">
        <div>
          <p className="account-label">
            ACCOUNT
          </p>

          <h2>My Account</h2>

          <p className="account-subtitle">
            Manage your profile and delivery addresses.
          </p>
        </div>

        <div className="account-header-icon">
          👤
        </div>
      </section>


      {/* =========================
          MESSAGE
      ========================== */}

      {message && (
        <div className="account-message">
          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}


      {/* =========================
          PROFILE
      ========================== */}

      <section className="profile-card">

        <div className="profile-card-header">
          <div className="profile-icon">
            👤
          </div>

          <div>
            <p className="section-label">
              PROFILE
            </p>

            <h3>
              Personal Information
            </h3>
          </div>
        </div>


        <div className="profile-grid">

          <div className="profile-field">
            <span>Name</span>
            <strong>
              {profile?.name || "Customer"}
            </strong>
          </div>


          <div className="profile-field">
            <span>Email</span>
            <strong>
              {profile?.email || "Not available"}
            </strong>
          </div>


          <div className="profile-field">
            <span>Account Type</span>
            <strong className="role-badge">
              {profile?.role || "customer"}
            </strong>
          </div>


          <div className="profile-field">
            <span>Account ID</span>
            <strong>
              #{profile?.id || "-"}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          ADDRESSES HEADER
      ========================== */}

      <section className="addresses-section">

        <div className="addresses-heading">

          <div>
            <p className="section-label">
              DELIVERY
            </p>

            <h3>
              Saved Addresses
            </h3>

            <p>
              Manage the addresses used for your orders.
            </p>
          </div>

          <button
            className="add-address-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add New Address
          </button>

        </div>


        {/* =========================
            ADDRESS FORM
        ========================== */}

        {showForm && (
          <form
            className="address-form"
            onSubmit={handleSubmit}
          >

            <div className="form-heading">
              <div>
                <p className="section-label">
                  {editingId
                    ? "EDIT ADDRESS"
                    : "NEW ADDRESS"}
                </p>

                <h3>
                  {editingId
                    ? "Edit Delivery Address"
                    : "Add Delivery Address"}
                </h3>
              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={resetForm}
              >
                ×
              </button>
            </div>


            <div className="address-form-grid">

              <div className="form-group">
                <label>
                  Full Name *
                </label>

                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  Phone Number *
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>


              <div className="form-group full-width">
                <label>
                  Address Line 1 *
                </label>

                <input
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleChange}
                  placeholder="House / Flat / Street"
                  required
                />
              </div>


              <div className="form-group full-width">
                <label>
                  Address Line 2
                </label>

                <input
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Landmark / Area"
                />
              </div>


              <div className="form-group">
                <label>
                  City *
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  State *
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  Postal Code *
                </label>

                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="Postal code"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  Country *
                </label>

                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
              </div>

            </div>


            <label className="default-address">
              <input
                type="checkbox"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
              />

              <span>
                Make this my default delivery address
              </span>
            </label>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-address-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-address-button"
                disabled={addressLoading}
              >
                {addressLoading
                  ? "Saving..."
                  : editingId
                    ? "Update Address"
                    : "Save Address"}
              </button>

            </div>

          </form>
        )}


        {/* =========================
            ADDRESS LIST
        ========================== */}

        {addresses.length === 0 ? (

          <div className="no-addresses">

            <div className="no-address-icon">
              📍
            </div>

            <h3>
              No saved addresses
            </h3>

            <p>
              Add a delivery address to make checkout faster.
            </p>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + Add Your First Address
            </button>

          </div>

        ) : (

          <div className="address-grid">

            {addresses.map((address) => (

              <article
                className="address-card"
                key={address.id}
              >

                <div className="address-card-top">

                  <div className="address-location-icon">
                    📍
                  </div>

                  <div>
                    <h4>
                      {address.full_name}
                    </h4>

                    {Boolean(address.is_default) && (
                      <span className="default-badge">
                        Default
                      </span>
                    )}
                  </div>

                </div>


                <div className="address-content">

                  <p>
                    {address.address_line1}
                  </p>

                  {address.address_line2 && (
                    <p>
                      {address.address_line2}
                    </p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state} -{" "}
                    {address.postal_code}
                  </p>

                  <p>
                    {address.country}
                  </p>

                  <p className="address-phone">
                    📞 {address.phone}
                  </p>

                </div>


                <div className="address-actions">

                  <button
                    onClick={() => handleEdit(address)}
                    disabled={addressLoading}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-address"
                    onClick={() => handleDelete(address.id)}
                    disabled={addressLoading}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =========================
          ORDER SHORTCUT
      ========================== */}

      <section className="account-order-shortcut">

        <div>
          <div className="shortcut-icon">
            📦
          </div>

          <div>
            <h3>
              View Your Orders
            </h3>

            <p>
              Track your purchases, payments and delivery status.
            </p>
          </div>
        </div>

        <button onClick={onOrders}>
          View My Orders →
        </button>

      </section>

    </div>
  );
}

export default MyAccount;