import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders =
        response.data.orders || [];

      const foundOrder = orders.find(
        (item) => item._id === id
      );

      if (!foundOrder) {
        setError("Order Not Found");
        return;
      }

      setOrder(foundOrder);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");
      setMessage("");

      const response = await axios.put(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Order cancelled successfully ✅"
      );

      await fetchOrder();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClass = (status) => {
    return `details-status status-${status
      ?.toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          <h2>Loading Order...</h2>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-not-found">
          <h2>Order Not Found</h2>

          <Link to="/orders">
            Back To My Orders
          </Link>
        </div>
      </div>
    );
  }

  const subtotal =
    Number(order.totalPrice) || 0;

  const discount =
    Number(order.discount) || 0;

  const finalAmount =
    Number(order.finalAmount) ||
    subtotal;

  const canCancel =
    order.status !== "Cancelled" &&
    order.status !== "Shipped" &&
    order.status !== "Delivered";

  return (
    <div className="order-details-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="order-details-header">
        <div>
          <Link
            to="/orders"
            className="back-orders-link"
          >
            ← Back To Orders
          </Link>

          <h1>Order Details</h1>

          <p>
            Order ID: #{order._id.slice(-8)}
          </p>
        </div>

        <span
          className={getStatusClass(
            order.status
          )}
        >
          {order.status}
        </span>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="order-details-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="order-details-message success">
          {message}
        </div>
      )}

      <div className="order-details-layout">

        {/* ==========================
            Main
        ========================== */}

        <div className="order-details-main">

          {/* Items */}

          <div className="order-details-section">
            <h2>Order Items</h2>

            <div className="details-items-list">

              {order.items?.map(
                (item, index) => {
                  const product =
                    item.product;

                  if (!product) {
                    return null;
                  }

                  const price =
                    Number(
                      product.price || 0
                    );

                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  const total =
                    price * quantity;

                  return (
                    <div
                      className="details-item"
                      key={
                        product._id ||
                        index
                      }
                    >
                      <div className="details-item-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <span>
                            No Image
                          </span>
                        )}
                      </div>

                      <div className="details-item-info">
                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          × {quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Address */}

          <div className="order-details-section">
            <h2>Delivery Address</h2>

            {order.address ? (
              <div className="order-address">
                <h3>
                  {order.address.fullName}
                </h3>

                <p>
                  {order.address.mobile}
                </p>

                <p>
                  {order.address.addressLine}
                </p>

                <p>
                  {order.address.city},{" "}
                  {order.address.state} -{" "}
                  {order.address.pincode}
                </p>

                <p>
                  {order.address.country}
                </p>
              </div>
            ) : (
              <p>
                Address information not available.
              </p>
            )}
          </div>

          {/* Order Timeline */}

          <div className="order-details-section">
            <h2>Order Status</h2>

            <div className="order-timeline">

              <div
                className={`timeline-step ${
                  [
                    "Pending",
                    "Confirmed",
                    "Shipped",
                    "Delivered",
                  ].includes(order.status)
                    ? "completed"
                    : ""
                }`}
              >
                <span>1</span>
                <div>
                  <strong>
                    Order Placed
                  </strong>
                  <p>
                    Your order has been placed.
                  </p>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  [
                    "Confirmed",
                    "Shipped",
                    "Delivered",
                  ].includes(order.status)
                    ? "completed"
                    : ""
                }`}
              >
                <span>2</span>
                <div>
                  <strong>
                    Confirmed
                  </strong>
                  <p>
                    Your order is confirmed.
                  </p>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  [
                    "Shipped",
                    "Delivered",
                  ].includes(order.status)
                    ? "completed"
                    : ""
                }`}
              >
                <span>3</span>
                <div>
                  <strong>
                    Shipped
                  </strong>
                  <p>
                    Your order has been shipped.
                  </p>
                </div>
              </div>

              <div
                className={`timeline-step ${
                  order.status === "Delivered"
                    ? "completed"
                    : ""
                }`}
              >
                <span>4</span>
                <div>
                  <strong>
                    Delivered
                  </strong>
                  <p>
                    Your order has been delivered.
                  </p>
                </div>
              </div>

            </div>

            {order.status ===
              "Cancelled" && (
              <div className="cancelled-order-box">
                This order has been cancelled.
              </div>
            )}
          </div>
        </div>

        {/* ==========================
            Summary
        ========================== */}

        <div className="order-details-summary">

          <h2>Order Summary</h2>

          <div className="details-summary-row">
            <span>Subtotal</span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="details-summary-row">
            <span>Discount</span>

            <strong className="discount-value">
              - ₹
              {discount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          {order.couponCode && (
            <div className="coupon-info">
              Coupon:{" "}
              <strong>
                {order.couponCode}
              </strong>
            </div>
          )}

          <div className="details-summary-divider" />

          <div className="details-summary-total">
            <span>Total</span>

            <strong>
              ₹
              {finalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="details-order-date">
            Ordered on{" "}
            {new Date(
              order.createdAt
            ).toLocaleDateString(
              "en-IN"
            )}
          </div>

          {canCancel && (
            <button
              type="button"
              className="details-cancel-btn"
              disabled={cancelling}
              onClick={handleCancelOrder}
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          )}

          <Link
            to="/products"
            className="details-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;