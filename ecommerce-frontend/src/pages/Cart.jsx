import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // ==========================
  // Fetch Cart
  // ==========================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/cart",
        {
          headers: getHeaders(),
        }
      );

      setCart(response.data.cart);
    } catch (error) {
      console.log(
        "Cart Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ==========================
  // Update Quantity
  // ==========================

  const handleQuantityChange = async (
    productId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingId(productId);
      setError("");

      await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        {
          quantity: newQuantity,
        },
        {
          headers: getHeaders(),
        }
      );

      await fetchCart();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update quantity"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================
  // Remove Item
  // ==========================

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      setError("");

      await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        {
          headers: getHeaders(),
        }
      );

      await fetchCart();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <h2>Loading Cart...</h2>
        </div>
      </div>
    );
  }

  // ==========================
  // Cart Items
  // ==========================

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = Number(
        item.product?.price || 0
      );

      const quantity = Number(
        item.quantity || 0
      );

      return total + price * quantity;
    },
    0
  );

  return (
    <div className="cart-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="cart-header">
        <div>
          <h1>Shopping Cart</h1>

          <p>
            Review your items before checkout.
          </p>
        </div>

        <Link
          to="/products"
          className="continue-shopping-btn"
        >
          ← Continue Shopping
        </Link>
      </div>

      {/* ==========================
          Error
      ========================== */}

      {error && (
        <div className="cart-error">
          {error}
        </div>
      )}

      {/* ==========================
          Empty Cart
      ========================== */}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your Cart Is Empty</h2>

          <p>
            Add some products to your cart and
            come back here.
          </p>

          <Link
            to="/products"
            className="shop-now-btn"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">

          {/* ==========================
              Cart Items
          ========================== */}

          <div className="cart-items-section">

            <div className="cart-items-header">
              <h2>
                Cart Items ({cartItems.length})
              </h2>
            </div>

            <div className="cart-items-list">

              {cartItems.map((item) => {
                const product = item.product;

                if (!product) {
                  return null;
                }

                const itemPrice =
                  Number(product.price) || 0;

                const itemQuantity =
                  Number(item.quantity) || 0;

                const itemTotal =
                  itemPrice * itemQuantity;

                const isUpdating =
                  updatingId === product._id;

                const isRemoving =
                  removingId === product._id;

                return (
                  <div
                    className="cart-item"
                    key={product._id}
                  >

                    {/* Product Image */}

                    <div className="cart-item-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <span>
                          No Image
                        </span>
                      )}
                    </div>

                    {/* Product Info */}

                    <div className="cart-item-info">

                      <Link
                        to={`/products/${product._id}`}
                        className="cart-product-name"
                      >
                        {product.name}
                      </Link>

                      {product.brand && (
                        <p>
                          Brand:{" "}
                          {product.brand}
                        </p>
                      )}

                      <p className="cart-item-price">
                        ₹
                        {itemPrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {/* Quantity */}

                      <div className="cart-quantity">
                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            itemQuantity <= 1
                          }
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              itemQuantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {isUpdating
                            ? "..."
                            : itemQuantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            itemQuantity >=
                              product.stock
                          }
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              itemQuantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}

                      <button
                        type="button"
                        className="remove-cart-btn"
                        disabled={isRemoving}
                        onClick={() =>
                          handleRemove(
                            product._id
                          )
                        }
                      >
                        {isRemoving
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>

                    {/* Total */}

                    <div className="cart-item-total">
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==========================
              Summary
          ========================== */}

          <div className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>

              <strong>
                Free
              </strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Proceed To Checkout
            </button>

            <Link
              to="/products"
              className="summary-shopping-link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;