const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      image,
    } = req.body;

    // Required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !brand ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All product fields are required",
      });
    }

    const productPrice = Number(price);
    const productStock = Number(stock);

    // Validate price
    if (
      Number.isNaN(productPrice) ||
      productPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (
      Number.isNaN(productStock) ||
      productStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Image URL from frontend
    let imageUrl =
      typeof image === "string"
        ? image.trim()
        : "";

    // Optional: direct file upload
    if (req.file) {
      const result = await new Promise(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "ecommerce-products",
              },
              (error, result) => {
                if (error) {
                  return reject(error);
                }

                resolve(result);
              }
            )
            .end(req.file.buffer);
        }
      );

      imageUrl = result.secure_url;
    }

    // Create Product
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: productPrice,
      category: category.trim(),
      brand: brand.trim(),
      stock: productStock,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.error(
      "ADD PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Products - Search + Filter + Pagination + Sorting
const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      page,
      limit,
      sort,
    } = req.query;

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const currentLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (currentPage - 1) * currentLimit;

    const filter = {};

    // Search
    if (keyword?.trim()) {
      filter.name = {
        $regex: keyword.trim(),
        $options: "i",
      };
    }

    // Category
    if (category?.trim()) {
      filter.category = category.trim();
    }

    // Brand
    if (brand?.trim()) {
      filter.brand = brand.trim();
    }

    // Minimum Price
    if (minPrice !== undefined) {
      const min = Number(minPrice);

      if (Number.isNaN(min) || min < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid Minimum Price",
        });
      }

      filter.price = {
        ...filter.price,
        $gte: min,
      };
    }

    // Maximum Price
    if (maxPrice !== undefined) {
      const max = Number(maxPrice);

      if (Number.isNaN(max) || max < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid Maximum Price",
        });
      }

      filter.price = {
        ...filter.price,
        $lte: max,
      };
    }

    // Check price range
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum Price cannot be greater than Maximum Price",
      });
    }

    // Sorting
    let sortOption = {};

    if (sort === "price_asc") {
      sortOption.price = 1;
    } else if (sort === "price_desc") {
      sortOption.price = -1;
    } else if (sort === "name_asc") {
      sortOption.name = 1;
    } else if (sort === "name_desc") {
      sortOption.name = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(currentLimit);

    const totalProducts =
      await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: currentPage,
      limit: currentLimit,
      totalProducts,
      totalPages: Math.ceil(
        totalProducts / currentLimit
      ),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Single Product
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      image,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }

      updateData.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product description cannot be empty",
        });
      }

      updateData.description =
        description.trim();
    }

    if (price !== undefined) {
      const productPrice = Number(price);

      if (
        Number.isNaN(productPrice) ||
        productPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than 0",
        });
      }

      updateData.price = productPrice;
    }

    if (category !== undefined) {
      updateData.category = category.trim();
    }

    if (brand !== undefined) {
      updateData.brand = brand.trim();
    }

    if (stock !== undefined) {
      const productStock = Number(stock);

      if (
        Number.isNaN(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }

      updateData.stock = productStock;
    }

    // Update Image URL
    if (image !== undefined) {
      updateData.image =
        typeof image === "string"
          ? image.trim()
          : "";
    }

    // Check if any field is provided
    if (
      Object.keys(updateData).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No Product Data Provided",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Product Updated Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Search Products
const searchProducts = async (req, res) => {
  try {
    const keyword =
      req.query.keyword?.trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Filter Products
const filterProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    if (category?.trim()) {
      filter.category = category.trim();
    }

    if (brand?.trim()) {
      filter.brand = brand.trim();
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);

      if (Number.isNaN(min) || min < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid Minimum Price",
        });
      }

      filter.price = {
        ...filter.price,
        $gte: min,
      };
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);

      if (Number.isNaN(max) || max < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid Maximum Price",
        });
      }

      filter.price = {
        ...filter.price,
        $lte: max,
      };
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum Price cannot be greater than Maximum Price",
      });
    }

    const products =
      await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addProduct,
  getProducts,
  searchProducts,
  filterProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};