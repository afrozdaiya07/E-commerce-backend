const Coupon = require("../models/Coupon");

// Create Coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon Already Exists",
      });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      message: "Coupon Created Successfully",
      coupon,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Apply Coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or Inactive Coupon",
      });
    }

    // Check expiry
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon Expired",
      });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum Order Amount is ${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;

    // Percentage Discount
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;

      if (
        coupon.maxDiscount !== null &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    }

    // Fixed Discount
    if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;

      if (discount > orderAmount) {
        discount = orderAmount;
      }
    }

    const finalAmount = orderAmount - discount;

    res.status(200).json({
      success: true,
      message: "Coupon Applied Successfully",
      couponCode: coupon.code,
      discount,
      finalAmount,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update Coupon
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon Updated Successfully",
      coupon,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Coupon
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createCoupon,
  getCoupons,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
};