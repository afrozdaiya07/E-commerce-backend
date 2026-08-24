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

    // Validate price
    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Upload image
    let imageUrl = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "ecommerce-products",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      brand,
      stock: Number(stock),
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });

  } catch (error) {
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

    const currentPage = Math.max(Number(page) || 1, 1);

    const currentLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * currentLimit;

    const filter = {};

    // Search
    if (keyword?.trim()) {
      filter.name = {
        $regex: keyword.trim(),
        $options: "i",
      };
    }

    // Category
    if (category) {
      filter.category = category;
    }

    // Brand
    if (brand) {
      filter.brand = brand;
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
        message: "Minimum Price cannot be greater than Maximum Price",
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

    // Get Products
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(currentLimit);

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: currentPage,
      limit: currentLimit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / currentLimit),
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
    const product = await Product.findById(req.params.id);

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
    } = req.body;

    // Validate price
    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (stock !== undefined) updateData.stock = Number(stock);

    const product = await Product.findByIdAndUpdate(
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
      message: "Product Updated Successfully",
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
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
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
    const keyword = req.query.keyword?.trim();

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

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    // Validate minPrice
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

    // Validate maxPrice
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
        message: "Minimum Price cannot be greater than Maximum Price",
      });
    }

    const products = await Product.find(filter);

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