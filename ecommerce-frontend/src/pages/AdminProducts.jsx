import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./AdminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");

  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [oldImage, setOldImage] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  // ==========================
  // Fetch Products
  // ==========================

  const fetchProducts = async () => {
    try {
      setFetchLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================
  // Select Image
  // ==========================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setError("");
    setMessage("");
  };

  // ==========================
  // Upload Image
  // ==========================

  const uploadImage = async () => {
    if (!imageFile) {
      return oldImage || "";
    }

    try {
      setUploadingImage(true);
      setError("");

      const formData = new FormData();

      formData.append("image", imageFile);

      const response = await api.post(
        "/upload",
        formData
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

  // ==========================
  // Clear Form
  // ==========================

  const clearForm = () => {
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
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

  // ==========================
  // Add / Update Product
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Validation
      if (
        !name.trim() ||
        !description.trim() ||
        price === "" ||
        !category.trim() ||
        !brand.trim() ||
        stock === ""
      ) {
        setError(
          "All product fields are required"
        );
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

      // Upload image
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
        response = await api.put(
          `/products/${editingId}`,
          productData
        );
      }

      // Add Product
      else {
        response = await api.post(
          "/products",
          productData
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

  // ==========================
  // Edit Product
  // ==========================

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

  // ==========================
  // Delete Product
  // ==========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/products/${id}`
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
          "Failed to delete product"
      );
    }
  };

  // ==========================
  // Render
  // ==========================

  return (
    <div className="admin-products-page">
      <div className="admin-products-container">

        {/* Header */}
        <div className="admin-products-header">
          <div>
            <p className="admin-products-badge">
              ADMIN PANEL
            </p>

            <h1>Product Management</h1>

            <p>
              Add, update and manage your store
              products.
            </p>
          </div>

          <div className="product-count-box">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="admin-alert admin-alert-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="admin-alert admin-alert-success">
            <span>✅</span>
            <p>{message}</p>
          </div>
        )}

        {/* Form */}
        <section className="admin-product-form-card">

          <div className="section-title">
            <div>
              <h2>
                {editingId
                  ? "Update Product"
                  : "Add New Product"}
              </h2>

              <p>
                Fill in the product information
                below.
              </p>
            </div>

            {editingId && (
              <span className="edit-mode-badge">
                Editing Product
              </span>
            )}
          </div>

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">
                Product Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter product name"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="e.g. Electronics"
              />
            </div>

            {/* Brand */}
            <div className="form-group">
              <label htmlFor="brand">
                Brand
              </label>

              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) =>
                  setBrand(e.target.value)
                }
                placeholder="Enter brand name"
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">
                Price
              </label>

              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="Enter price"
              />
            </div>

            {/* Stock */}
            <div className="form-group">
              <label htmlFor="stock">
                Stock
              </label>

              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                placeholder="Enter stock quantity"
              />
            </div>

            {/* Description */}
            <div className="form-group form-group-full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                rows="5"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Enter product description"
              />
            </div>

            {/* Image */}
            <div className="form-group form-group-full">
              <label htmlFor="image">
                Product Image
              </label>

              <div className="image-upload-box">
                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <p>
                  Select an image for the product
                </p>
              </div>
            </div>

            {/* Preview */}
            {imagePreview && (
              <div className="form-group form-group-full">
                <label>Image Preview</label>

                <div className="admin-image-preview">
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="form-actions form-group-full">

              <button
                type="submit"
                className="btn-save-product"
                disabled={
                  loading || uploadingImage
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
                <button
                  type="button"
                  className="btn-cancel-edit"
                  onClick={() => {
                    clearForm();
                    setError("");
                    setMessage("");
                  }}
                  disabled={
                    loading || uploadingImage
                  }
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Products */}
        <section className="admin-products-list-section">

          <div className="products-list-header">
            <div>
              <h2>All Products</h2>
              <p>
                Manage your available products.
              </p>
            </div>
          </div>

          {fetchLoading ? (
            <div className="admin-products-loading">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="admin-products-empty">
              <div className="empty-icon">📦</div>

              <h3>No Products Found</h3>

              <p>
                Add your first product using the
                form above.
              </p>
            </div>
          ) : (
            <div className="admin-products-grid">

              {products.map((product) => (
                <div
                  className="admin-product-card"
                  key={product._id}
                >

                  {/* Image */}
                  <div className="admin-product-image-wrapper">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="admin-product-image"
                      />
                    ) : (
                      <div className="admin-product-no-image">
                        <span>📷</span>
                        <p>No Image</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="admin-product-content">

                    <div className="product-category">
                      {product.category}
                    </div>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-brand">
                      Brand:{" "}
                      <strong>
                        {product.brand || "N/A"}
                      </strong>
                    </p>

                    <p className="product-description">
                      {product.description}
                    </p>

                    {/* Price + Stock */}
                    <div className="product-meta">

                      <div className="product-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </div>

                      <div
                        className={`product-stock ${
                          product.stock === 0
                            ? "out-of-stock"
                            : product.stock <= 5
                            ? "low-stock"
                            : ""
                        }`}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : `Stock: ${product.stock}`}
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="product-actions">

                      <button
                        type="button"
                        className="btn-edit-product"
                        onClick={() =>
                          handleEdit(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn-delete-product"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default AdminProducts;