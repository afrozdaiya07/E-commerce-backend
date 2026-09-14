import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          "Failed to fetch product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.post(
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
        response.data.message || "Product Added To Cart ✅"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <h2>Loading Product...</h2>;
  }

  if (error && !product) {
    return <h2>{error}</h2>;
  }

  if (!product) {
    return <h2>Product Not Found</h2>;
  }

  return (
    <div>
      <h1>{product.name}</h1>

      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          width="300"
        />
      )}

      <h2>₹{product.price}</h2>

      <p>{product.description}</p>

      <p>Category: {product.category}</p>
      <p>Brand: {product.brand}</p>
      <p>Stock: {product.stock}</p>

      {product.stock > 0 ? (
        <div>
          <label>Quantity: </label>

          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
          />

          <br />
          <br />

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart
              ? "Adding..."
              : "Add To Cart"}
          </button>
        </div>
      ) : (
        <p>Out of Stock</p>
      )}

      {message && <p>{message}</p>}

      {error && product && <p>{error}</p>}
    </div>
  );
}

export default ProductDetails;