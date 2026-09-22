import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState(0);
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0);
  const [coupons, setCoupons] = useState(0);

  const [revenue, setRevenue] = useState(0);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [confirmedOrders, setConfirmedOrders] = useState(0);
  const [shippedOrders, setShippedOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        usersResponse,
        productsResponse,
        ordersResponse,
        couponsResponse,
      ] = await Promise.all([
        // Users
        axios.get(
          "http://localhost:5000/api/users/admin",
          {
            headers,
          }
        ),

        // Products
        axios.get(
          "http://localhost:5000/api/products"
        ),

        // All Orders - Admin
        axios.get(
          "http://localhost:5000/api/orders/all",
          {
            headers,
          }
        ),

        // Coupons
        axios.get(
          "http://localhost:5000/api/coupons",
          {
            headers,
          }
        ),
      ]);

      // ==========================
      // Basic Counts
      // ==========================

      const usersData =
        usersResponse.data.users || [];

      const productsData =
        productsResponse.data.products || [];

      const ordersData =
        ordersResponse.data.orders || [];

      const couponsData =
        couponsResponse.data.coupons || [];

      setUsers(
        usersResponse.data.count ??
          usersData.length
      );

      setProducts(
        productsResponse.data.count ??
          productsData.length
      );

      setOrders(
        ordersResponse.data.count ??
          ordersData.length
      );

      setCoupons(
        couponsResponse.data.count ??
          couponsData.length
      );

      // ==========================
      // Revenue
      // ==========================

      const totalRevenue = ordersData.reduce(
        (total, order) => {
          if (order.status === "Cancelled") {
            return total;
          }

          const amount =
            Number(order.finalAmount) ||
            Number(order.totalPrice) ||
            0;

          return total + amount;
        },
        0
      );

      setRevenue(totalRevenue);

      // ==========================
      // Order Status Counts
      // ==========================

      setPendingOrders(
        ordersData.filter(
          (order) =>
            order.status === "Pending"
        ).length
      );

      setConfirmedOrders(
        ordersData.filter(
          (order) =>
            order.status === "Confirmed"
        ).length
      );

      setShippedOrders(
        ordersData.filter(
          (order) =>
            order.status === "Shipped"
        ).length
      );

      setDeliveredOrders(
        ordersData.filter(
          (order) =>
            order.status === "Delivered"
        ).length
      );

      // ==========================
      // Recent Orders
      // ==========================

      const sortedOrders = [...ordersData]
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5);

      setRecentOrders(sortedOrders);
    } catch (error) {
      console.log(
        "Dashboard Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* ==========================
          Header
      ========================== */}

      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Manage your e-commerce store
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchDashboardData}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* ==========================
          Main Statistics
      ========================== */}

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <h3>Total Users</h3>

          <p>{users}</p>

          <Link to="/admin/users">
            Manage Users →
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Total Products</h3>

          <p>{products}</p>

          <Link to="/admin/products">
            Manage Products →
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Total Orders</h3>

          <p>{orders}</p>

          <Link to="/admin/orders">
            Manage Orders →
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Total Coupons</h3>

          <p>{coupons}</p>

          <Link to="/admin/coupons">
            Manage Coupons →
          </Link>
        </div>
      </div>

      {/* ==========================
          Revenue
      ========================== */}

      <div className="revenue-card">
        <div>
          <h2>Total Revenue</h2>

          <p>
            ₹{revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ==========================
          Order Status
      ========================== */}

      <div className="status-section">
        <h2>Order Status</h2>

        <div className="status-grid">
          <div className="status-card">
            <span>Pending</span>
            <strong>{pendingOrders}</strong>
          </div>

          <div className="status-card">
            <span>Confirmed</span>
            <strong>{confirmedOrders}</strong>
          </div>

          <div className="status-card">
            <span>Shipped</span>
            <strong>{shippedOrders}</strong>
          </div>

          <div className="status-card">
            <span>Delivered</span>
            <strong>{deliveredOrders}</strong>
          </div>
        </div>
      </div>

      {/* ==========================
          Recent Orders
      ========================== */}

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>

          <Link to="/admin/orders">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p>No Orders Found</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => {
                  const customerName =
                    order.user?.name ||
                    order.user?.email ||
                    "User";

                  const amount =
                    Number(order.finalAmount) ||
                    Number(order.totalPrice) ||
                    0;

                  return (
                    <tr key={order._id}>
                      <td>
                        {order._id.slice(-8)}
                      </td>

                      <td>
                        {customerName}
                      </td>

                      <td>
                        ₹
                        {amount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        <span
                          className={`order-status status-${order.status?.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================
          Quick Actions
      ========================== */}

      <div className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="quick-action-grid">
          <Link
            to="/admin/products"
            className="quick-action"
          >
            Manage Products
          </Link>

          <Link
            to="/admin/orders"
            className="quick-action"
          >
            Manage Orders
          </Link>

          <Link
            to="/admin/coupons"
            className="quick-action"
          >
            Manage Coupons
          </Link>

          <Link
            to="/admin/users"
            className="quick-action"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;