import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Products.css";

function Products() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!token) {
      setError("Please login to add product to cart");
      return;
    }

    try {
      setAddingId(productId);
      setError("");
      setMessage("");

      await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Product added to cart successfully ✅");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.brand?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="products-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="products-header">
        <div>
          <h1>Our Products</h1>
          <p>
            Explore our latest products and find
            what you need.
          </p>
        </div>

        <div className="products-search">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="products-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="products-message success">
          {message}
        </div>
      )}

      {/* ==========================
          Loading
      ========================== */}

      {loading ? (
        <div className="products-loading">
          <h2>Loading Products...</h2>
        </div>
      ) : (
        <>
          <div className="products-count">
            {filteredProducts.length} Product
            {filteredProducts.length !== 1
              ? "s"
              : ""}{" "}
            Found
          </div>

          {/* ==========================
              No Products
          ========================== */}

          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <h2>No Products Found</h2>
              <p>
                Try searching with a different
                keyword.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div
                  className="product-card"
                  key={product._id}
                >
                  {/* Image */}

                  <div className="product-image-wrapper">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-no-image">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}

                  <div className="product-content">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h2>{product.name}</h2>

                    {product.brand && (
                      <p className="product-brand">
                        {product.brand}
                      </p>
                    )}

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-price">
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}
                    </div>

                    <p
                      className={
                        product.stock > 0
                          ? "product-stock in-stock"
                          : "product-stock out-stock"
                      }
                    >
                      {product.stock > 0
                        ? `In Stock (${product.stock})`
                        : "Out of Stock"}
                    </p>

                    {/* Buttons */}

                    <div className="product-actions">
                      <Link
                        to={`/products/${product._id}`}
                        className="view-product-btn"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="add-cart-btn"
                        disabled={
                          product.stock <= 0 ||
                          addingId === product._id
                        }
                        onClick={() =>
                          handleAddToCart(
                            product._id
                          )
                        }
                      >
                        {addingId === product._id
                          ? "Adding..."
                          : product.stock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;