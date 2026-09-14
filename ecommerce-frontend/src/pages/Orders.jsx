import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
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

  if (loading) {
    return <h2>Loading Orders...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id}>
            <h2>
              Order ID: {order._id}
            </h2>

            <p>
              Status: {order.status}
            </p>

            <p>
              Total Price: ₹{order.totalPrice}
            </p>

            <p>
              Discount: ₹{order.discount}
            </p>

            <h3>
              Final Amount: ₹{order.finalAmount}
            </h3>

            <p>
              Items: {order.items.length}
            </p>

            <Link to={`/orders/${order._id}`}>
              <button>
                View Details
              </button>
            </Link>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;