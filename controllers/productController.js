const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Add Product
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

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

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
    const keyword = req.query.keyword || "";

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