import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async (search = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/products",
        {
          params: {
            keyword: search.trim() || undefined,
          },
        }
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("PRODUCT ERROR:", error);

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(keyword);
  };

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <br />

      {loading && <h2>Loading Products...</h2>}

      {error && <h2>{error}</h2>}

      {!loading && !error && (
        <div>
          {products.length === 0 ? (
            <p>No Products Found</p>
          ) : (
            products.map((product) => (
              <div key={product._id}>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    width="200"
                  />
                )}

                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <h3>₹{product.price}</h3>

                <p>Category: {product.category}</p>
                <p>Brand: {product.brand}</p>
                <p>Stock: {product.stock}</p>

                <Link to={`/products/${product._id}`}>
                  <button type="button">
                    View Details
                  </button>
                </Link>

                <button type="button">
                  Add To Cart
                </button>

                <hr />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Products;