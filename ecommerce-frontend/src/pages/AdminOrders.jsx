import { useEffect, useState } from "react";
import axios from "axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch All Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/orders/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Order Status Updated Successfully ✅"
      );

      fetchOrders();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <h2>Loading Orders...</h2>;
  }

  return (
    <div>
      <h1>Admin Order Management</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <hr />

      <h2>All Orders</h2>

      {orders.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        orders.map((order) => {
          const totalItems = order.items.reduce(
            (total, item) =>
              total + item.quantity,
            0
          );

          return (
            <div key={order._id}>
              <h3>
                Order ID: {order._id}
              </h3>

              <p>
                Customer:{" "}
                {order.user?.name || "Unknown"}
              </p>

              <p>
                Email:{" "}
                {order.user?.email || "Unknown"}
              </p>

              <p>
                Total Items: {totalItems}
              </p>

              <p>
                Total Price: ₹{order.totalPrice}
              </p>

              <p>
                Discount: ₹{order.discount}
              </p>

              <h3>
                Final Amount: ₹
                {order.finalAmount}
              </h3>

              <p>
                Order Date:{" "}
                {new Date(
                  order.createdAt
                ).toLocaleString()}
              </p>

              <h3>
                Current Status: {order.status}
              </h3>

              <label>
                Change Status:
              </label>

              <select
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
                <p>Updating...</p>
              )}

              <hr />
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminOrders;