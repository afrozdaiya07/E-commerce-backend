import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [product, setProduct] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================
  // Fetch Product
  // ==========================

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/products/${id}`
      );

      setProduct(response.data.product);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch Reviews
  // ==========================

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/${id}`
      );

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.log(
        "Review Error:",
        error.response?.data?.message
      );
    }
  };

  // ==========================
  // Fetch Average Rating
  // ==========================

  const fetchAverageRating = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/rating/${id}`
      );

      setAverageRating(
        Number(response.data.averageRating) || 0
      );
    } catch (error) {
      console.log(
        "Rating Error:",
        error.response?.data?.message
      );
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchAverageRating();
  }, [id]);

  // ==========================
  // Add To Cart
  // ==========================

  const handleAddToCart = async () => {
    if (!token) {
      setError("Please login to add product to cart");
      return;
    }

    if (!product || product.stock <= 0) {
      setError("Product is out of stock");
      return;
    }

    try {
      setAddingCart(true);
      setError("");
      setMessage("");

      await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId: product._id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Product added to cart successfully ✅"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    } finally {
      setAddingCart(false);
    }
  };

  // ==========================
  // Add To Wishlist
  // ==========================

  const handleAddToWishlist = async () => {
    if (!token) {
      setError("Please login to add product to wishlist");
      return;
    }

    try {
      setAddingWishlist(true);
      setError("");
      setMessage("");

      await axios.post(
        "http://localhost:5000/api/wishlist",
        {
          productId: product._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Product added to wishlist successfully ❤️"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product to wishlist"
      );
    } finally {
      setAddingWishlist(false);
    }
  };

  // ==========================
  // Submit Review
  // ==========================

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Please login to write a review");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review comment");
      return;
    }

    try {
      setReviewLoading(true);
      setError("");
      setMessage("");

      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          productId: product._id,
          rating: Number(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComment("");
      setRating(5);

      setMessage("Review added successfully ✅");

      await fetchReviews();
      await fetchAverageRating();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add review"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // ==========================
  // Delete Review
  // ==========================

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      setError("");
      setMessage("");

      await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Review deleted successfully ✅");

      await fetchReviews();
      await fetchAverageRating();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete review"
      );
    } finally {
      setDeletingReview(null);
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-details-loading">
          <h2>Loading Product...</h2>
        </div>
      </div>
    );
  }

  // ==========================
  // Product Not Found
  // ==========================

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-not-found">
          <h2>Product Not Found</h2>

          <Link to="/products">
            Back To Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="details-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="details-message success">
          {message}
        </div>
      )}

      {/* ==========================
          Product Details
      ========================== */}

      <div className="product-details-container">

        {/* Image */}

        <div className="details-image-section">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="details-product-image"
            />
          ) : (
            <div className="details-no-image">
              No Image Available
            </div>
          )}
        </div>

        {/* Information */}

        <div className="details-info-section">

          <span className="details-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          {product.brand && (
            <p className="details-brand">
              Brand: <strong>{product.brand}</strong>
            </p>
          )}

          <div className="details-rating">
            <span className="stars">
              {"★".repeat(
                Math.round(averageRating)
              )}
              {"☆".repeat(
                5 - Math.round(averageRating)
              )}
            </span>

            <span>
              {averageRating.toFixed(1)} / 5
            </span>

            <span>
              ({reviews.length} reviews)
            </span>
          </div>

          <div className="details-price">
            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}
          </div>

          <p className="details-description">
            {product.description}
          </p>

          <div
            className={
              product.stock > 0
                ? "details-stock in-stock"
                : "details-stock out-stock"
            }
          >
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </div>

          {/* Quantity */}

          {product.stock > 0 && (
            <div className="quantity-section">
              <label htmlFor="quantity">
                Quantity
              </label>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.max(1, prev - 1)
                    )
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(
                        product.stock,
                        prev + 1
                      )
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="details-actions">

            <button
              type="button"
              className="details-cart-btn"
              disabled={
                product.stock <= 0 ||
                addingCart
              }
              onClick={handleAddToCart}
            >
              {addingCart
                ? "Adding..."
                : product.stock <= 0
                ? "Out of Stock"
                : "Add To Cart"}
            </button>

            <button
              type="button"
              className="details-wishlist-btn"
              disabled={addingWishlist}
              onClick={handleAddToWishlist}
            >
              {addingWishlist
                ? "Adding..."
                : "♡ Add To Wishlist"}
            </button>
          </div>

          <Link
            to="/products"
            className="back-products-link"
          >
            ← Back To Products
          </Link>
        </div>
      </div>

      {/* ==========================
          Reviews Section
      ========================== */}

      <div className="reviews-section">

        <div className="reviews-header">
          <h2>Customer Reviews</h2>

          <div className="overall-rating">
            <strong>
              {averageRating.toFixed(1)}
            </strong>

            <span>
              {"★".repeat(
                Math.round(averageRating)
              )}
              {"☆".repeat(
                5 - Math.round(averageRating)
              )}
            </span>
          </div>
        </div>

        {/* Add Review */}

        {token ? (
          <form
            className="review-form"
            onSubmit={handleSubmitReview}
          >
            <h3>Write A Review</h3>

            <label htmlFor="rating">
              Rating
            </label>

            <select
              id="rating"
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
            >
              <option value="5">
                5 - Excellent
              </option>

              <option value="4">
                4 - Very Good
              </option>

              <option value="3">
                3 - Good
              </option>

              <option value="2">
                2 - Average
              </option>

              <option value="1">
                1 - Poor
              </option>
            </select>

            <label htmlFor="comment">
              Comment
            </label>

            <textarea
              id="comment"
              rows="4"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={reviewLoading}
            >
              {reviewLoading
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="login-review-box">
            <p>
              Please login to write a review.
            </p>

            <Link to="/login">
              Login
            </Link>
          </div>
        )}

        {/* Reviews List */}

        <div className="reviews-list">

          {reviews.length === 0 ? (
            <div className="no-reviews">
              <h3>No Reviews Yet</h3>

              <p>
                Be the first to review this
                product.
              </p>
            </div>
          ) : (
            reviews.map((review) => {

              const reviewUser =
                review.user?.name ||
                "User";

              const isOwnReview =
                user &&
                review.user?._id === user._id;

              return (
                <div
                  className="review-card"
                  key={review._id}
                >
                  <div className="review-top">

                    <div>
                      <h3>
                        {reviewUser}
                      </h3>

                      <span className="review-date">
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : ""}
                      </span>
                    </div>

                    <div className="review-rating">
                      {"★".repeat(
                        Number(review.rating)
                      )}
                      {"☆".repeat(
                        5 -
                          Number(review.rating)
                      )}
                    </div>
                  </div>

                  <p className="review-comment">
                    {review.comment}
                  </p>

                  {isOwnReview && (
                    <button
                      type="button"
                      className="delete-review-btn"
                      disabled={
                        deletingReview ===
                        review._id
                      }
                      onClick={() =>
                        handleDeleteReview(
                          review._id
                        )
                      }
                    >
                      {deletingReview ===
                      review._id
                        ? "Deleting..."
                        : "Delete Review"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;