import { useEffect, useState } from "react";
import axios from "axios";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState("percentage");
  const [discountValue, setDiscountValue] =
    useState("");
  const [minOrderAmount, setMinOrderAmount] =
    useState("0");
  const [maxDiscount, setMaxDiscount] =
    useState("");
  const [expiryDate, setExpiryDate] =
    useState("");
  const [isActive, setIsActive] =
    useState(true);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  const token = localStorage.getItem("token");

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setError("");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/coupons",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCoupons(
        response.data.coupons || []
      );
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

  // Clear Form
  const clearForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount("0");
    setMaxDiscount("");
    setExpiryDate("");
    setIsActive(true);
    setEditingId(null);
  };

  // Add / Update Coupon
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {
        setError("Please Login First");
        return;
      }

      if (!code.trim()) {
        setError("Coupon Code is required");
        return;
      }

      if (discountValue === "") {
        setError(
          "Discount Value is required"
        );
        return;
      }

      if (!expiryDate) {
        setError(
          "Expiry Date is required"
        );
        return;
      }

      const numericDiscount =
        Number(discountValue);

      const numericMinOrder =
        Number(minOrderAmount);

      const numericMaxDiscount =
        maxDiscount === ""
          ? null
          : Number(maxDiscount);

      if (
        !Number.isFinite(
          numericDiscount
        ) ||
        numericDiscount < 0
      ) {
        setError(
          "Enter a valid discount value"
        );
        return;
      }

      if (
        !Number.isFinite(
          numericMinOrder
        ) ||
        numericMinOrder < 0
      ) {
        setError(
          "Enter a valid minimum order amount"
        );
        return;
      }

      if (
        numericMaxDiscount !== null &&
        (!Number.isFinite(
          numericMaxDiscount
        ) ||
          numericMaxDiscount < 0)
      ) {
        setError(
          "Enter a valid maximum discount"
        );
        return;
      }

      const couponData = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue:
          numericDiscount,
        minOrderAmount:
          numericMinOrder,
        maxDiscount:
          numericMaxDiscount,
        expiryDate,
        isActive,
      };

      let response;

      if (editingId) {
        response = await axios.put(
          `http://localhost:5000/api/coupons/${editingId}`,
          couponData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/coupons",
          couponData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

  // Edit Coupon
  const handleEdit = (coupon) => {
    setEditingId(coupon._id);

    setCode(coupon.code || "");

    setDiscountType(
      coupon.discountType ||
        "percentage"
    );

    setDiscountValue(
      coupon.discountValue ?? ""
    );

    setMinOrderAmount(
      coupon.minOrderAmount ?? 0
    );

    setMaxDiscount(
      coupon.maxDiscount ?? ""
    );

    setExpiryDate(
      coupon.expiryDate
        ? new Date(coupon.expiryDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setIsActive(
      coupon.isActive !== false
    );

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Coupon
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/coupons/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  return (
    <div className="admin-coupons-page">
      <h1>Admin Coupon Management</h1>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      <hr />

      {/* Coupon Form */}
      <section className="admin-coupon-form-card">
        <h2>
          {editingId
            ? "Update Coupon"
            : "Create Coupon"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Coupon Code</label>
            <br />

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="SAVE10"
            />
          </div>

          <br />

          <div>
            <label>
              Discount Type
            </label>
            <br />

            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(
                  e.target.value
                )
              }
            >
              <option value="percentage">
                Percentage
              </option>

              <option value="fixed">
                Fixed
              </option>
            </select>
          </div>

          <br />

          <div>
            <label>
              Discount Value
            </label>
            <br />

            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(
                  e.target.value
                )
              }
              placeholder="10"
            />
          </div>

          <br />

          <div>
            <label>
              Minimum Order Amount
            </label>
            <br />

            <input
              type="number"
              min="0"
              value={minOrderAmount}
              onChange={(e) =>
                setMinOrderAmount(
                  e.target.value
                )
              }
              placeholder="1000"
            />
          </div>

          <br />

          <div>
            <label>
              Maximum Discount
            </label>
            <br />

            <input
              type="number"
              min="0"
              value={maxDiscount}
              onChange={(e) =>
                setMaxDiscount(
                  e.target.value
                )
              }
              placeholder="10000"
            />
          </div>

          <br />

          <div>
            <label>
              Expiry Date
            </label>
            <br />

            <input
              type="date"
              value={expiryDate}
              onChange={(e) =>
                setExpiryDate(
                  e.target.value
                )
              }
            />
          </div>

          <br />

          <div>
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked
                  )
                }
                style={{
                  width: "auto",
                }}
              />

              {" "}Active Coupon
            </label>
          </div>

          <br />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Coupon"
              : "Create Coupon"}
          </button>

          {editingId && (
            <>
              {" "}

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
              >
                Cancel Edit
              </button>
            </>
          )}
        </form>
      </section>

      <hr />

      {/* Coupons */}
      <h2>All Coupons</h2>

      {coupons.length === 0 ? (
        <p>No Coupons Found</p>
      ) : (
        <div className="admin-coupons-grid">
          {coupons.map((coupon) => (
            <div
              className="admin-coupon-card"
              key={coupon._id}
            >
              <h3>
                {coupon.code}
              </h3>

              <p>
                Type:{" "}
                {coupon.discountType}
              </p>

              <p>
                Discount:{" "}
                {coupon.discountValue}
                {coupon.discountType ===
                "percentage"
                  ? "%"
                  : " ₹"}
              </p>

              <p>
                Minimum Order: ₹
                {coupon.minOrderAmount}
              </p>

              <p>
                Maximum Discount:{" "}
                {coupon.maxDiscount !== null
                  ? `₹${coupon.maxDiscount}`
                  : "No Limit"}
              </p>

              <p>
                Expiry:{" "}
                {new Date(
                  coupon.expiryDate
                ).toLocaleDateString()}
              </p>

              <p>
                Status:{" "}
                {coupon.isActive
                  ? "Active"
                  : "Inactive"}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleEdit(coupon)
                }
              >
                Edit
              </button>

              {" "}

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    coupon._id
                  )
                }
                disabled={
                  deletingId ===
                  coupon._id
                }
              >
                {deletingId === coupon._id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;