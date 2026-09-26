import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch All Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/all");

      setOrders(response.data.orders || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Order Status
  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setMessage("");

      const response = await api.put(`/orders/${orderId}`, {
        status,
      });

      setMessage(
        response.data.message ||
          "Order Status Updated Successfully ✅"
      );

      await fetchOrders();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";

      case "Confirmed":
        return "status-confirmed";

      case "Shipped":
        return "status-shipped";

      case "Delivered":
        return "status-delivered";

      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-container">
          <div className="orders-loading-card">
            <div className="loading-spinner"></div>
            <h2>Loading Orders...</h2>
            <p>Please wait while we load all orders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">

        {/* Header */}
        <div className="admin-orders-header">
          <div>
            <span className="admin-orders-label">
              ADMIN PANEL
            </span>

            <h1>Order Management</h1>

            <p>
              Manage customer orders and update their
              delivery status.
            </p>
          </div>

          <div className="orders-count-box">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="order-message order-error">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="order-message order-success">
            ✅ {message}
          </div>
        )}

        {/* Orders */}
        <div className="orders-section">
          <div className="section-heading">
            <div>
              <h2>All Orders</h2>
              <p>View and manage every customer order.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders-card">
              <div className="empty-icon">📦</div>

              <h3>No Orders Found</h3>

              <p>
                There are currently no customer orders
                available.
              </p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                const totalItems = (order.items || []).reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                );

                return (
                  <div
                    className="admin-order-card"
                    key={order._id}
                  >
                    {/* Card Top */}
                    <div className="order-card-top">
                      <div>
                        <span className="order-small-label">
                          ORDER ID
                        </span>

                        <h3 className="order-id">
                          #{order._id}
                        </h3>
                      </div>

                      <span
                        className={`order-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="order-customer">
                      <div className="customer-avatar">
                        {(order.user?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="customer-name">
                          {order.user?.name || "Unknown Customer"}
                        </p>

                        <p className="customer-email">
                          {order.user?.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    {/* Order Stats */}
                    <div className="order-stats">
                      <div className="order-stat">
                        <span>Total Items</span>
                        <strong>{totalItems}</strong>
                      </div>

                      <div className="order-stat">
                        <span>Total Price</span>
                        <strong>
                          ₹{Number(order.totalPrice || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div className="order-stat">
                        <span>Discount</span>
                        <strong>
                          ₹{Number(order.discount || 0).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Final Amount */}
                    <div className="final-amount-box">
                      <div>
                        <span>Final Amount</span>
                        <small>
                          After discount
                        </small>
                      </div>

                      <strong>
                        ₹
                        {Number(
                          order.finalAmount || 0
                        ).toLocaleString()}
                      </strong>
                    </div>

                    {/* Products */}
                    <div className="order-items-section">
                      <h4>Order Items</h4>

                      <div className="order-items-list">
                        {(order.items || []).map(
                          (item, index) => (
                            <div
                              className="order-item"
                              key={item._id || index}
                            >
                              <div className="item-number">
                                {index + 1}
                              </div>

                              <div className="item-info">
                                <p>
                                  {item.product?.name ||
                                    item.name ||
                                    "Product"}
                                </p>

                                <span>
                                  Quantity:{" "}
                                  {item.quantity || 0}
                                </span>
                              </div>

                              <strong>
                                ₹
                                {Number(
                                  item.price || 0
                                ).toLocaleString()}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="order-date">
                      <span>Order Date</span>

                      <strong>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString()
                          : "Not Available"}
                      </strong>
                    </div>

                    {/* Status Update */}
                    <div className="status-update-section">
                      <label htmlFor={`status-${order._id}`}>
                        Update Order Status
                      </label>

                      <select
                        id={`status-${order._id}`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value
                          )
                        }
                        disabled={
                          updatingId === order._id
                        }
                        className={
                          updatingId === order._id
                            ? "status-select updating"
                            : "status-select"
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>
                      </select>

                      {updatingId === order._id && (
                        <div className="updating-text">
                          <span className="mini-spinner"></span>
                          Updating order status...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;