import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update Quantity
  const updateQuantity = async (cartId, quantity) => {
    try {
      setMessage("");
      setError("");

      if (quantity < 1) {
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/cart/${cartId}`,
        {
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Cart Updated Successfully"
      );

      await fetchCart();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update cart"
      );
    }
  };

  // Remove Item
  const removeItem = async (cartId) => {
    try {
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/cart/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product Removed From Cart"
      );

      await fetchCart();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  };

  // Total Items
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return <h2>Loading Cart...</h2>;
  }

  if (error && cart.length === 0) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Cart</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item._id}>
              <h2>{item.product.name}</h2>

              <p>
                Price: ₹{item.product.price}
              </p>

              <div>
                <button
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>

                <span style={{ margin: "0 10px" }}>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      item.quantity + 1
                    )
                  }
                  disabled={
                    item.quantity >= item.product.stock
                  }
                >
                  +
                </button>
              </div>

              <p>
                Total: ₹
                {item.product.price * item.quantity}
              </p>

              <button
                onClick={() =>
                  removeItem(item._id)
                }
              >
                Remove
              </button>

              <hr />
            </div>
          ))}

          {/* Cart Summary */}
          <div>
            <h2>Cart Summary</h2>

            <p>
              Total Items: {totalItems}
            </p>

            <h2>
              Subtotal: ₹{subtotal}
            </h2>

            <button
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;