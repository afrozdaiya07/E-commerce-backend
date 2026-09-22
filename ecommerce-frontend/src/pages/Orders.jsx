import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.log(
        "Orders Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);
      setError("");
      setMessage("");

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
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

      await fetchOrders();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusClass = (status) => {
    return `order-status-badge status-${status
      ?.toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <h2>Loading Orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="orders-header">
        <div>
          <h1>My Orders</h1>

          <p>
            View and manage your orders.
          </p>
        </div>

        <Link
          to="/products"
          className="orders-shop-btn"
        >
          Continue Shopping
        </Link>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="orders-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="orders-message success">
          {message}
        </div>
      )}

      {/* ==========================
          Empty Orders
      ========================== */}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">
            📦
          </div>

          <h2>No Orders Yet</h2>

          <p>
            You have not placed any orders yet.
          </p>

          <Link
            to="/products"
            className="start-shopping-btn"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">

          {orders.map((order) => {
            const orderAmount =
              Number(order.finalAmount) ||
              Number(order.totalPrice) ||
              0;

            const itemCount =
              order.items?.reduce(
                (total, item) =>
                  total +
                  Number(item.quantity || 0),
                0
              ) || 0;

            const isCancelled =
              order.status === "Cancelled";

            const canCancel =
              !isCancelled &&
              order.status !== "Shipped" &&
              order.status !== "Delivered";

            return (
              <div
                className="order-card"
                key={order._id}
              >

                {/* ==========================
                    Order Header
                ========================== */}

                <div className="order-card-header">
                  <div>
                    <span className="order-label">
                      Order ID
                    </span>

                    <strong>
                      #{order._id.slice(-8)}
                    </strong>
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
                    Order Info
                ========================== */}

                <div className="order-card-info">

                  <div>
                    <span>Items</span>
                    <strong>
                      {itemCount}
                    </strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>
                      ₹
                      {orderAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Order Date</span>
                    <strong>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      {order.couponCode
                        ? `Coupon: ${order.couponCode}`
                        : "Order Placed"}
                    </strong>
                  </div>
                </div>

                {/* ==========================
                    Product Preview
                ========================== */}

                <div className="order-products-preview">

                  {order.items
                    ?.slice(0, 3)
                    .map((item, index) => {
                      const product =
                        item.product;

                      if (!product) {
                        return null;
                      }

                      return (
                        <div
                          className="order-product-preview"
                          key={
                            product._id ||
                            index
                          }
                        >
                          <div className="order-product-image">
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

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <p>
                              Qty:{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  {order.items?.length > 3 && (
                    <span className="more-items">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                {/* ==========================
                    Actions
                ========================== */}

                <div className="order-card-actions">

                  <Link
                    to={`/orders/${order._id}`}
                    className="view-order-btn"
                  >
                    View Details
                  </Link>

                  {canCancel && (
                    <button
                      type="button"
                      className="cancel-order-btn"
                      disabled={
                        cancellingId ===
                        order._id
                      }
                      onClick={() =>
                        handleCancelOrder(
                          order._id
                        )
                      }
                    >
                      {cancellingId ===
                      order._id
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;