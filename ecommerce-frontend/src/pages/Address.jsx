import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Address.css";

function Address() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================
  // Fetch Addresses
  // ==========================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/address",
        {
          headers,
        }
      );

      setAddresses(
        response.data.addresses || []
      );
    } catch (error) {
      console.log(
        "Address Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ==========================
  // Handle Input
  // ==========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // Reset Form
  // ==========================

  const resetForm = () => {
    setForm({
      fullName: "",
      mobile: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    });

    setEditingId(null);
  };

  // ==========================
  // Submit Form
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        // Update Address

        const response = await axios.put(
          `http://localhost:5000/api/address/${editingId}`,
          form,
          {
            headers,
          }
        );

        setMessage(
          response.data.message ||
            "Address updated successfully ✅"
        );
      } else {
        // Add Address

        const response = await axios.post(
          "http://localhost:5000/api/address",
          form,
          {
            headers,
          }
        );

        setMessage(
          response.data.message ||
            "Address added successfully ✅"
        );
      }

      resetForm();

      await fetchAddresses();
    } catch (error) {
      console.log(
        "Save Address Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to save address"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // Edit Address
  // ==========================

  const handleEdit = (address) => {
    setEditingId(address._id);

    setForm({
      fullName: address.fullName || "",
      mobile: address.mobile || "",
      addressLine:
        address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================
  // Delete Address
  // ==========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const response = await axios.delete(
        `http://localhost:5000/api/address/${id}`,
        {
          headers,
        }
      );

      setMessage(
        response.data.message ||
          "Address deleted successfully ✅"
      );

      await fetchAddresses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete address"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="address-page">
        <div className="address-loading">
          <h2>Loading Addresses...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="address-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="address-header">
        <div>
          <h1>My Addresses</h1>

          <p>
            Manage your delivery addresses.
          </p>
        </div>

        <button
          type="button"
          className="back-checkout-btn"
          onClick={() =>
            navigate("/checkout")
          }
        >
          Back To Checkout
        </button>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="address-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="address-message success">
          {message}
        </div>
      )}

      <div className="address-layout">

        {/* ==========================
            Form
        ========================== */}

        <div className="address-form-section">

          <div className="address-section-header">
            <h2>
              {editingId
                ? "Edit Address"
                : "Add New Address"}
            </h2>

            {editingId && (
              <button
                type="button"
                className="cancel-edit-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="address-form"
            onSubmit={handleSubmit}
          >

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="addressLine">
                Address
              </label>

              <textarea
                id="addressLine"
                name="addressLine"
                rows="4"
                placeholder="House no, street, area..."
                value={form.addressLine}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Enter state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pincode">
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="Enter pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Enter country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="save-address-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Address"
                : "Add Address"}
            </button>

          </form>
        </div>

        {/* ==========================
            Address List
        ========================== */}

        <div className="saved-addresses-section">

          <div className="address-list-header">
            <h2>
              Saved Addresses
            </h2>

            <span>
              {addresses.length} Address
              {addresses.length !== 1
                ? "es"
                : ""}
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="no-addresses">
              <div className="no-address-icon">
                📍
              </div>

              <h3>
                No Address Saved
              </h3>

              <p>
                Add an address for delivery.
              </p>
            </div>
          ) : (
            <div className="saved-address-list">

              {addresses.map((address) => (
                <div
                  className="saved-address-card"
                  key={address._id}
                >
                  <div className="saved-address-top">
                    <div>
                      <h3>
                        {address.fullName}
                      </h3>

                      <span>
                        {address.mobile}
                      </span>
                    </div>

                    <span className="address-badge">
                      Delivery Address
                    </span>
                  </div>

                  <div className="saved-address-content">
                    <p>
                      {address.addressLine}
                    </p>

                    <p>
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </p>

                    <p>
                      {address.country}
                    </p>
                  </div>

                  <div className="address-card-actions">

                    <button
                      type="button"
                      className="edit-address-btn"
                      onClick={() =>
                        handleEdit(address)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-address-btn"
                      disabled={
                        deletingId ===
                        address._id
                      }
                      onClick={() =>
                        handleDelete(
                          address._id
                        )
                      }
                    >
                      {deletingId ===
                      address._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Address;