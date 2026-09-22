import { useEffect, useState } from "react";
import axios from "axios";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      setWishlist(response.data.wishlist || []);
    } catch (error) {
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

  const removeFromWishlist = async (wishlistId) => {
    try {
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

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
          "Product Removed From Wishlist"
      );

      await fetchWishlist();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to remove from wishlist"
      );
    }
  };

  if (loading) {
    return <h2>Loading Wishlist...</h2>;
  }

  if (error && wishlist.length === 0) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Wishlist</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {wishlist.length === 0 ? (
        <p>Your Wishlist is Empty</p>
      ) : (
        wishlist.map((item) => (
          <div key={item._id}>
            <h2>{item.product.name}</h2>

            {item.product.image && (
              <img
                src={item.product.image}
                alt={item.product.name}
                width="200"
              />
            )}

            <p>
              Price: ₹{item.product.price}
            </p>

            <p>
              Category: {item.product.category}
            </p>

            <p>
              Brand: {item.product.brand}
            </p>

            <button
              onClick={() =>
                removeFromWishlist(item._id)
              }
            >
              Remove From Wishlist
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Wishlist;