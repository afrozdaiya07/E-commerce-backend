const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Create Payment
const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Validate input
    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Payment Method are required",
      });
    }

    // Validate payment method
    const allowedMethods = ["COD", "ONLINE"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment Method",
      });
    }

    // Find user's order
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

    // Cannot pay for cancelled order
    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot Pay for Cancelled Order",
      });
    }

    // Check existing payment
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

    // Create payment
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
    })
      .populate("order")
      .sort({ createdAt: -1 });

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

    // Validate payment status
    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment Status",
      });
    }

    // Find user's payment
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    // Prevent changing already paid payment
    if (payment.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment Already Completed",
      });
    }

    // Update payment
    payment.paymentStatus = paymentStatus;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    await payment.save();

    // Get related order
    const order = await Order.findOne({
      _id: payment.order,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Related Order Not Found",
      });
    }

    // Update order status
    if (paymentStatus === "PAID") {
      order.status = "Confirmed";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment Status Updated Successfully",
      payment,
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
  createPayment,
  getMyPayments,
  updatePaymentStatus,
};