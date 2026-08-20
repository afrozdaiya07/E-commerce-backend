const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");


// Place Order
const placeOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order Items are Required",
      });
    }

    let totalPrice = 0;
    const validatedItems = [];

    // Validate Products + Calculate Total
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product Not Found",
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid Quantity",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Stock for ${product.name}`,
        });
      }

      totalPrice += product.price * item.quantity;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // Coupon
    let discount = 0;
    let finalAmount = totalPrice;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or Inactive Coupon",
        });
      }

      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: "Coupon Expired",
        });
      }

      if (totalPrice < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum Order Amount is ${coupon.minOrderAmount}`,
        });
      }

      if (coupon.discountType === "percentage") {
        discount = (totalPrice * coupon.discountValue) / 100;

        if (
          coupon.maxDiscount !== null &&
          discount > coupon.maxDiscount
        ) {
          discount = coupon.maxDiscount;
        }
      }

      if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;

        if (discount > totalPrice) {
          discount = totalPrice;
        }
      }

      finalAmount = totalPrice - discount;
      appliedCouponCode = coupon.code;
    }

    // Create Order
    const order = await Order.create({
      user: req.user.id,
      items: validatedItems,
      totalPrice,
      couponCode: appliedCouponCode,
      discount,
      finalAmount,
    });

    // Reduce Product Stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // Clear User Cart
    await Cart.deleteMany({
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get My Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate("items.product");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order Status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Status Updated Successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Cancel My Order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (["Shipped", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order Cannot Be Cancelled",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order Already Cancelled",
      });
    }

    // Restore Product Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order Cancelled Successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
};