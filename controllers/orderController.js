const Order = require("../models/Order");

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
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

module.exports = {
  placeOrder,
};