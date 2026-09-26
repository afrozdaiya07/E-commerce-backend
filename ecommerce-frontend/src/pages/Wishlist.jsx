import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================
  // Fetch Wishlist
  // ==========================

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWishlist(
        response.data.wishlist || []
      );
    } catch (error) {
      console.log(
        "Wishlist Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ==========================
  // Remove Wishlist Item
  // ==========================

  const removeFromWishlist = async (
    wishlistId
  ) => {
    try {
      setError("");
      setMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/wishlist/${wishlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product Removed From Wishlist ✅"
      );

      await fetchWishlist();
    } catch (error) {
      console.log(
        "Remove Wishlist Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to remove from wishlist"
      );
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <h2>Loading Wishlist...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>

          <p>
            Save your favorite products for
            later.
          </p>
        </div>

        <Link
          to="/products"
          className="wishlist-shop-btn"
        >
          Continue Shopping
        </Link>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {message && (
        <div className="wishlist-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="wishlist-message error">
          {error}
        </div>
      )}

      {/* ==========================
          Empty Wishlist
      ========================== */}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wishlist-icon">
            ♡
          </div>

          <h2>Your Wishlist Is Empty</h2>

          <p>
            Add products to your wishlist and
            they will appear here.
          </p>

          <Link
            to="/products"
            className="empty-wishlist-btn"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">

          {wishlist.map((item) => {
            const product = item.product;

            if (!product) {
              return null;
            }

            const price =
              Number(product.price) || 0;

            const stock =
              Number(product.stock) || 0;

            return (
              <div
                className="wishlist-card"
                key={item._id}
              >

                {/* Image */}

                <div className="wishlist-image-wrapper">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="wishlist-no-image">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Content */}

                <div className="wishlist-content">

                  {product.category && (
                    <span className="wishlist-category">
                      {product.category}
                    </span>
                  )}

                  <h2>
                    {product.name}
                  </h2>

                  {product.brand && (
                    <p className="wishlist-brand">
                      Brand: {product.brand}
                    </p>
                  )}

                  <div className="wishlist-price">
                    ₹
                    {price.toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <p
                    className={`wishlist-stock ${
                      stock > 0
                        ? "wishlist-in-stock"
                        : "wishlist-out-stock"
                    }`}
                  >
                    {stock > 0
                      ? `In Stock (${stock})`
                      : "Out of Stock"}
                  </p>

                  {/* Actions */}

                  <div className="wishlist-actions">

                    <Link
                      to={`/products/${product._id}`}
                      className="wishlist-view-btn"
                    >
                      View Product
                    </Link>

                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() =>
                        removeFromWishlist(
                          item._id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;