import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [selectedAddress, setSelectedAddress] =
    useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [couponLoading, setCouponLoading] =
    useState(false);
  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================
  // Fetch Cart + Addresses
  // ==========================

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const [cartResponse, addressResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/cart",
            { headers }
          ),

          axios.get(
            "http://localhost:5000/api/address",
            { headers }
          ),
        ]);

      const cartData =
        cartResponse.data.cart;

      const addressData =
        addressResponse.data.addresses || [];

      setCart(cartData);
      setAddresses(addressData);

      if (addressData.length > 0) {
        setSelectedAddress(
          addressData[0]._id
        );
      }

      const items = cartData?.items || [];

      const subtotal = items.reduce(
        (total, item) => {
          const price =
            Number(
              item.product?.price || 0
            );

          const quantity =
            Number(item.quantity || 0);

          return total + price * quantity;
        },
        0
      );

      setFinalAmount(subtotal);
    } catch (error) {
      console.log(
        "Checkout Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  // ==========================
  // Calculate Subtotal
  // ==========================

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce(
    (total, item) => {
      const price =
        Number(
          item.product?.price || 0
        );

      const quantity =
        Number(item.quantity || 0);

      return total + price * quantity;
    },
    0
  );

  // ==========================
  // Apply Coupon
  // ==========================

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/coupons/apply",
        {
          code: couponCode.trim(),
          orderAmount: subtotal,
        },
        {
          headers,
        }
      );

      const data = response.data;

      setAppliedCoupon(
        data.coupon || {
          code: couponCode
            .trim()
            .toUpperCase(),
        }
      );

      const discountAmount =
        Number(data.discount) || 0;

      setDiscount(discountAmount);
      setFinalAmount(
        Math.max(
          0,
          subtotal - discountAmount
        )
      );

      setMessage(
        data.message ||
          "Coupon Applied Successfully ✅"
      );
    } catch (error) {
      setAppliedCoupon(null);
      setDiscount(0);
      setFinalAmount(subtotal);

      setError(
        error.response?.data?.message ||
          "Invalid Coupon"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ==========================
  // Remove Coupon
  // ==========================

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
    setFinalAmount(subtotal);
    setMessage("Coupon Removed");
    setError("");
  };

  // ==========================
  // Place Order
  // ==========================

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError(
        "Please select a delivery address"
      );
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      setMessage("");

      const items = cartItems.map(
        (item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })
      );

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          address: selectedAddress,
          items,
          couponCode:
            appliedCoupon?.code || "",
        },
        {
          headers,
        }
      );

      const order =
        response.data.order;

      setMessage(
        "Order placed successfully ✅"
      );

      navigate("/payment", {
        state: {
          order,
        },
      });
    } catch (error) {
      console.log(
        "Place Order Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">
          <h2>Loading Checkout...</h2>
        </div>
      </div>
    );
  }

  // ==========================
  // Empty Cart
  // ==========================

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your Cart Is Empty</h2>

          <p>
            Add products before going to
            checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="checkout-header">
        <h1>Checkout</h1>

        <p>
          Complete your order securely.
        </p>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="checkout-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="checkout-message success">
          {message}
        </div>
      )}

      <div className="checkout-layout">

        {/* ==========================
            Left Section
        ========================== */}

        <div className="checkout-main">

          {/* Address */}

          <div className="checkout-section">
            <div className="section-title">
              <h2>Delivery Address</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/address")
                }
              >
                Manage Addresses
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="no-address">
                <p>
                  No delivery address found.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/address")
                  }
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((address) => (
                  <label
                    className={`address-card ${
                      selectedAddress ===
                      address._id
                        ? "selected"
                        : ""
                    }`}
                    key={address._id}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address._id}
                      checked={
                        selectedAddress ===
                        address._id
                      }
                      onChange={(e) =>
                        setSelectedAddress(
                          e.target.value
                        )
                      }
                    />

                    <div>
                      <h3>
                        {address.fullName}
                      </h3>

                      <p>
                        {address.mobile}
                      </p>

                      <p>
                        {address.addressLine}
                      </p>

                      <p>
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <p>
                        {address.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Coupon */}

          <div className="checkout-section">
            <h2>Coupon Code</h2>

            {appliedCoupon ? (
              <div className="applied-coupon">
                <div>
                  <strong>
                    {appliedCoupon.code}
                  </strong>

                  <span>
                    Coupon Applied
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRemoveCoupon
                  }
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="coupon-box">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  disabled={couponLoading}
                  onClick={
                    handleApplyCoupon
                  }
                >
                  {couponLoading
                    ? "Applying..."
                    : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Products */}

          <div className="checkout-section">
            <h2>Order Items</h2>

            <div className="checkout-items">
              {cartItems.map((item) => {
                const product =
                  item.product;

                if (!product) {
                  return null;
                }

                const price =
                  Number(
                    product.price || 0
                  );

                const quantity =
                  Number(item.quantity || 0);

                const total =
                  price * quantity;

                return (
                  <div
                    className="checkout-item"
                    key={product._id}
                  >
                    <div className="checkout-item-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <span>
                          No Image
                        </span>
                      )}
                    </div>

                    <div className="checkout-item-info">
                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}{" "}
                        × {quantity}
                      </p>
                    </div>

                    <strong>
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================
            Order Summary
        ========================== */}

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <strong>Free</strong>
          </div>

          <div className="summary-row discount-row">
            <span>Discount</span>

            <strong>
              - ₹
              {discount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>
              ₹
              {finalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <button
            type="button"
            className="place-order-btn"
            disabled={
              placingOrder ||
              addresses.length === 0
            }
            onClick={handlePlaceOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>

          <p className="secure-checkout">
            Your order will be processed securely.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;