import { useEffect, useRef, useState } from "react";
import axios from "axios";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [oldImage, setOldImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Select Image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Remove previous preview URL
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setError("");
    setMessage("");
  };

  // Upload Image To Cloudinary
  const uploadImage = async () => {
    if (!imageFile) {
      return oldImage || "";
    }

    try {
      setUploadingImage(true);
      setError("");

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        throw new Error("Please Login First");
      }

      const formData = new FormData();

      formData.append("image", imageFile);

      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.data?.imageUrl) {
        throw new Error(
          "Cloudinary image URL not received"
        );
      }

      return response.data.imageUrl;
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error.response?.data || error
      );

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Image upload failed"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Clear Form
  const clearForm = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setBrand("");
    setStock("");

    setImageFile(null);
    setImagePreview("");
    setOldImage("");

    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add / Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setError("Please Login First");
        return;
      }

      if (
        !name.trim() ||
        !description.trim() ||
        price === "" ||
        !category.trim() ||
        !brand.trim() ||
        stock === ""
      ) {
        setError("All product fields are required");
        return;
      }

      const numericPrice = Number(price);
      const numericStock = Number(stock);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        setError("Enter a valid price");
        return;
      }

      if (
        !Number.isInteger(numericStock) ||
        numericStock < 0
      ) {
        setError("Enter a valid stock");
        return;
      }

      // Upload image first
      const imageUrl = await uploadImage();

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        category: category.trim(),
        brand: brand.trim(),
        stock: numericStock,
      };

      if (imageUrl) {
        productData.image = imageUrl;
      }

      let response;

      // Update Product
      if (editingId) {
        response = await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Add Product
      else {
        response = await axios.post(
          "http://localhost:5000/api/products",
          productData,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setMessage(
        response.data.message ||
          (editingId
            ? "Product Updated Successfully ✅"
            : "Product Added Successfully ✅")
      );

      clearForm();

      await fetchProducts();
    } catch (error) {
      console.error(
        "PRODUCT OPERATION ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Product operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit Product
  const handleEdit = (product) => {
    setEditingId(product._id);

    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price ?? "");
    setCategory(product.category || "");
    setBrand(product.brand || "");
    setStock(product.stock ?? "");

    setOldImage(product.image || "");
    setImagePreview(product.image || "");
    setImageFile(null);

    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Product
  const handleDelete = async (id) => {
    try {
      setError("");
      setMessage("");

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setError("Please Login First");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product Deleted Successfully ✅"
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    }
  };

  return (
    <div className="admin-products-page">
      <h1>Admin Product Management</h1>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      <hr />

      <section className="admin-product-form-card">
        <h2>
          {editingId
            ? "Update Product"
            : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div>
            <label>Product Name</label>
            <br />

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter Product Name"
            />
          </div>

          <br />

          {/* Description */}
          <div>
            <label>Description</label>
            <br />

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter Description"
            />
          </div>

          <br />

          {/* Price */}
          <div>
            <label>Price</label>
            <br />

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              placeholder="Enter Price"
            />
          </div>

          <br />

          {/* Category */}
          <div>
            <label>Category</label>
            <br />

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Enter Category"
            />
          </div>

          <br />

          {/* Brand */}
          <div>
            <label>Brand</label>
            <br />

            <input
              type="text"
              value={brand}
              onChange={(e) =>
                setBrand(e.target.value)
              }
              placeholder="Enter Brand"
            />
          </div>

          <br />

          {/* Stock */}
          <div>
            <label>Stock</label>
            <br />

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value)
              }
              placeholder="Enter Stock"
            />
          </div>

          <br />

          {/* Image Upload */}
          <div>
            <label>
              Product Image
            </label>
            <br />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <br />

          {/* Image Preview */}
          {imagePreview && (
            <div>
              <p>
                <strong>
                  Image Preview
                </strong>
              </p>

              <img
                src={imagePreview}
                alt="Product Preview"
                width="200"
              />
            </div>
          )}

          <br />

          {/* Buttons */}
          <button
            type="submit"
            disabled={
              loading ||
              uploadingImage
            }
          >
            {uploadingImage
              ? "Uploading Image..."
              : loading
              ? "Saving..."
              : editingId
              ? "Update Product"
              : "Add Product"}
          </button>

          {editingId && (
            <>
              {" "}

              <button
                type="button"
                onClick={clearForm}
                disabled={
                  loading ||
                  uploadingImage
                }
              >
                Cancel Edit
              </button>
            </>
          )}
        </form>
      </section>

      <hr />

      <h2>All Products</h2>

      {products.length === 0 ? (
        <p>No Products Found</p>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => (
            <div
              className="admin-product-card"
              key={product._id}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  width="200"
                />
              ) : (
                <div className="no-image">
                  No Image
                </div>
              )}

              <h3>{product.name}</h3>

              <p>
                {product.description}
              </p>

              <p>
                Price: ₹{product.price}
              </p>

              <p>
                Category:{" "}
                {product.category}
              </p>

              <p>
                Brand: {product.brand}
              </p>

              <p>
                Stock: {product.stock}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleEdit(product)
                }
              >
                Edit
              </button>

              {" "}

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    product._id
                  )
                }
              >
                Delete
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminProducts;