const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Create Payment
const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Payment Method are required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot Pay for Cancelled Order",
      });
    }

    const existingPayment = await Payment.findOne({
      order: orderId,
      user: req.user.id,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment Already Exists For This Order",
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      order: orderId,
      amount: order.finalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Payment Created Successfully",
      payment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get My Payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
    }).populate("order");

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payment Status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const allowedStatuses = ["PENDING", "PAID", "FAILED"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment Status",
      });
    }

    const payment = await Payment.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        paymentStatus,
        transactionId,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment Status Updated Successfully",
      payment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createPayment,
  getMyPayments,
  updatePaymentStatus,
};