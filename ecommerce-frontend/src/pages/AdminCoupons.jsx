import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminCoupons.css";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* Fetch Coupons */
  const fetchCoupons = async () => {
    try {
      setError("");

      const response = await api.get("/coupons");

      setCoupons(response.data.coupons || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch coupons"
      );
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* Clear Form */
  const clearForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount("0");
    setMaxDiscount("");
    setExpiryDate("");
    setIsActive(true);
    setEditingId(null);
    setError("");
  };

  /* Submit Coupon */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!code.trim()) {
        setError("Coupon Code is required");
        return;
      }

      if (discountValue === "") {
        setError("Discount Value is required");
        return;
      }

      if (!expiryDate) {
        setError("Expiry Date is required");
        return;
      }

      const numericDiscount = Number(discountValue);
      const numericMinOrder = Number(minOrderAmount);
      const numericMaxDiscount =
        maxDiscount === "" ? null : Number(maxDiscount);

      if (
        !Number.isFinite(numericDiscount) ||
        numericDiscount < 0
      ) {
        setError("Enter a valid discount value");
        return;
      }

      if (
        !Number.isFinite(numericMinOrder) ||
        numericMinOrder < 0
      ) {
        setError("Enter a valid minimum order amount");
        return;
      }

      if (
        numericMaxDiscount !== null &&
        (!Number.isFinite(numericMaxDiscount) ||
          numericMaxDiscount < 0)
      ) {
        setError("Enter a valid maximum discount");
        return;
      }

      /* Percentage Validation */
      if (
        discountType === "percentage" &&
        numericDiscount > 100
      ) {
        setError(
          "Percentage discount cannot be more than 100%"
        );
        return;
      }

      const couponData = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: numericDiscount,
        minOrderAmount: numericMinOrder,
        maxDiscount: numericMaxDiscount,
        expiryDate,
        isActive,
      };

      let response;

      if (editingId) {
        response = await api.put(
          `/coupons/${editingId}`,
          couponData
        );
      } else {
        response = await api.post(
          "/coupons",
          couponData
        );
      }

      setMessage(
        response.data.message ||
          (editingId
            ? "Coupon Updated Successfully ✅"
            : "Coupon Created Successfully ✅")
      );

      clearForm();
      await fetchCoupons();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Coupon operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* Edit Coupon */
  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setCode(coupon.code || "");
    setDiscountType(
      coupon.discountType || "percentage"
    );
    setDiscountValue(coupon.discountValue ?? "");
    setMinOrderAmount(coupon.minOrderAmount ?? 0);
    setMaxDiscount(coupon.maxDiscount ?? "");

    setExpiryDate(
      coupon.expiryDate
        ? new Date(coupon.expiryDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setIsActive(coupon.isActive !== false);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* Delete Coupon */
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const response = await api.delete(
        `/coupons/${id}`
      );

      setMessage(
        response.data.message ||
          "Coupon Deleted Successfully ✅"
      );

      await fetchCoupons();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete coupon"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* Status Class */
  const getStatusClass = (coupon) => {
    if (!coupon.isActive) {
      return "coupon-inactive";
    }

    if (
      coupon.expiryDate &&
      new Date(coupon.expiryDate) < new Date()
    ) {
      return "coupon-expired";
    }

    return "coupon-active";
  };

  const getStatusText = (coupon) => {
    if (!coupon.isActive) {
      return "Inactive";
    }

    if (
      coupon.expiryDate &&
      new Date(coupon.expiryDate) < new Date()
    ) {
      return "Expired";
    }

    return "Active";
  };

  /* Responsive */
  return (
    <div className="admin-coupons-page">
      <div className="admin-coupons-container">
        {/* Header */}
        <div className="coupons-page-header">
          <div>
            <span className="admin-section-label">
              ADMIN PANEL
            </span>

            <h1>Coupon Management</h1>

            <p>
              Create, update and manage discount coupons
              for your customers.
            </p>
          </div>

          <div className="coupon-count-card">
            <span>Total Coupons</span>
            <strong>{coupons.length}</strong>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="coupon-message coupon-error">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="coupon-message coupon-success">
            ✅ {message}
          </div>
        )}

        {/* Create / Update Form */}
        <section className="coupon-form-card">
          <div className="coupon-form-header">
            <div>
              <span className="form-small-label">
                {editingId ? "EDIT COUPON" : "NEW COUPON"}
              </span>

              <h2>
                {editingId
                  ? "Update Coupon"
                  : "Create Coupon"}
              </h2>

              <p>
                Set discount rules and coupon availability.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="cancel-top-btn"
                onClick={clearForm}
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="coupon-form"
            onSubmit={handleSubmit}
          >
            {/* Coupon Code */}
            <div className="form-group">
              <label htmlFor="coupon-code">
                Coupon Code
              </label>

              <input
                id="coupon-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SAVE10"
                maxLength={30}
              />

              <small>
                Example: SAVE10, FESTIVE20
              </small>
            </div>

            {/* Discount Type */}
            <div className="form-group">
              <label htmlFor="discount-type">
                Discount Type
              </label>

              <select
                id="discount-type"
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value)
                }
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed Amount
                </option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="form-group">
              <label htmlFor="discount-value">
                Discount Value
              </label>

              <div className="input-with-symbol">
                <input
                  id="discount-value"
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(e.target.value)
                  }
                  placeholder={
                    discountType === "percentage"
                      ? "10"
                      : "500"
                  }
                />

                <span>
                  {discountType === "percentage"
                    ? "%"
                    : "₹"}
                </span>
              </div>
            </div>

            {/* Minimum Order */}
            <div className="form-group">
              <label htmlFor="min-order">
                Minimum Order Amount
              </label>

              <div className="input-with-symbol">
                <span>₹</span>

                <input
                  id="min-order"
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) =>
                    setMinOrderAmount(e.target.value)
                  }
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Maximum Discount */}
            <div className="form-group">
              <label htmlFor="max-discount">
                Maximum Discount
              </label>

              <div className="input-with-symbol">
                <span>₹</span>

                <input
                  id="max-discount"
                  type="number"
                  min="0"
                  value={maxDiscount}
                  onChange={(e) =>
                    setMaxDiscount(e.target.value)
                  }
                  placeholder="No Limit"
                />
              </div>

              <small>
                Leave empty for no maximum limit.
              </small>
            </div>

            {/* Expiry */}
            <div className="form-group">
              <label htmlFor="expiry-date">
                Expiry Date
              </label>

              <input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(e.target.value)
                }
              />
            </div>

            {/* Active */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(e.target.checked)
                  }
                />

                <span className="custom-check"></span>

                <span>Active Coupon</span>
              </label>

              <small>
                Active coupons can be applied by customers.
              </small>
            </div>

            {/* Buttons */}
            <div className="coupon-form-actions">
              <button
                type="submit"
                className="coupon-primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Coupon"
                  : "Create Coupon"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="coupon-secondary-btn"
                  onClick={clearForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* All Coupons */}
        <section className="all-coupons-section">
          <div className="coupons-section-header">
            <div>
              <h2>All Coupons</h2>

              <p>
                View and manage your discount coupons.
              </p>
            </div>
          </div>

          {coupons.length === 0 ? (
            <div className="no-coupons-card">
              <div className="coupon-empty-icon">
                🎟️
              </div>

              <h3>No Coupons Found</h3>

              <p>
                Create your first coupon to offer
                discounts to customers.
              </p>
            </div>
          ) : (
            <div className="coupons-grid">
              {coupons.map((coupon) => (
                <div
                  className="coupon-card"
                  key={coupon._id}
                >
                  {/* Card Header */}
                  <div className="coupon-card-header">
                    <div>
                      <span className="coupon-code-label">
                        COUPON CODE
                      </span>

                      <h3>{coupon.code}</h3>
                    </div>

                    <span
                      className={`coupon-status ${getStatusClass(
                        coupon
                      )}`}
                    >
                      {getStatusText(coupon)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="discount-banner">
                    <div>
                      <span>Discount</span>

                      <strong>
                        {coupon.discountValue}
                        {coupon.discountType ===
                        "percentage"
                          ? "%"
                          : " ₹"}
                      </strong>
                    </div>

                    <div className="discount-type">
                      {coupon.discountType ===
                      "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="coupon-details">
                    <div className="coupon-detail-row">
                      <span>Minimum Order</span>

                      <strong>
                        ₹
                        {Number(
                          coupon.minOrderAmount || 0
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div className="coupon-detail-row">
                      <span>Maximum Discount</span>

                      <strong>
                        {coupon.maxDiscount !== null &&
                        coupon.maxDiscount !== undefined
                          ? `₹${Number(
                              coupon.maxDiscount
                            ).toLocaleString()}`
                          : "No Limit"}
                      </strong>
                    </div>

                    <div className="coupon-detail-row">
                      <span>Expiry Date</span>

                      <strong>
                        {coupon.expiryDate
                          ? new Date(
                              coupon.expiryDate
                            ).toLocaleDateString("en-IN")
                          : "No Date"}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="coupon-actions">
                    <button
                      type="button"
                      className="edit-coupon-btn"
                      onClick={() => handleEdit(coupon)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-coupon-btn"
                      onClick={() =>
                        handleDelete(coupon._id)
                      }
                      disabled={deletingId === coupon._id}
                    >
                      {deletingId === coupon._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminCoupons;