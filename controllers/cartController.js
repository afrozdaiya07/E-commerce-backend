const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add To Cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Check existing cart item
    const existingCartItem = await Cart.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      // Check total quantity with stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart Quantity Updated",
        cartItem: existingCartItem,
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      user: req.user.id,
      product: productId,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Product Added To Cart",
      cartItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.find({
      user: req.user.id,
    }).populate("product");

    res.status(200).json({
      success: true,
      cart,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Cart Quantity
// Update Cart Quantity
const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;

    // Check quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart item
    const cartItem = await Cart.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("product");

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart Item Not Found",
      });
    }

    // Check product stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} items available in stock`,
      });
    }

    cartItem.quantity = quantity;

    await cartItem.save();

    res.status(200).json({
      success: true,
      message: "Cart Updated Successfully",
      cartItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Remove From Cart
const removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart Item Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Removed From Cart",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};