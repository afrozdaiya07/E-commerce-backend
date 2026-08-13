const Payment = require("../models/Payment");

// Create Payment
const createPayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentMethod,
    } = req.body;

    const payment = await Payment.create({
      user: req.user.id,
      order: orderId,
      amount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
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

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
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