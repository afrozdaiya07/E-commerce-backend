import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // ==========================
  // No Order
  // ==========================

  if (!order) {
    return (
      <div className="payment-page">
        <div className="payment-empty">
          <div className="payment-icon">
            💳
          </div>

          <h2>Order Not Found</h2>

          <p>
            Please place an order before opening
            the payment page.
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

  // ==========================
  // Payment
  // ==========================

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // ==========================
      // Create Payment
      // ==========================

      const response = await axios.post(
        "http://localhost:5000/api/payments",
        {
          orderId: order._id,
          paymentMethod,
        },
        {
          headers,
        }
      );

      const payment =
        response.data.payment;

      // ==========================
      // COD
      // ==========================

      if (paymentMethod === "COD") {
        setMessage(
          "Cash on Delivery selected successfully ✅"
        );

        setTimeout(() => {
          navigate("/orders");
        }, 700);

        return;
      }

      // ==========================
      // ONLINE - Demo
      // ==========================

      const transactionId =
        `DEMO-${Date.now()}`;

      await axios.put(
        `http://localhost:5000/api/payments/${payment._id}/status`,
        {
          paymentStatus: "PAID",
          transactionId,
        },
        {
          headers,
        }
      );

      setMessage(
        "Online Payment Successful ✅"
      );

      setTimeout(() => {
        navigate("/orders");
      }, 700);
    } catch (error) {
      console.log(
        "Payment Error:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data?.message ||
          "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const orderAmount =
    Number(order.finalAmount) ||
    Number(order.totalPrice) ||
    0;

  const orderItems =
    order.items || [];

  return (
    <div className="payment-page">

      {/* ==========================
          Header
      ========================== */}

      <div className="payment-header">
        <div>
          <h1>Payment</h1>

          <p>
            Complete your payment to confirm
            your order.
          </p>
        </div>
      </div>

      {/* ==========================
          Messages
      ========================== */}

      {error && (
        <div className="payment-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="payment-message success">
          {message}
        </div>
      )}

      <div className="payment-layout">

        {/* ==========================
            Order Details
        ========================== */}

        <div className="payment-main">

          {/* Order Info */}

          <div className="payment-section">
            <div className="payment-section-header">
              <h2>Order Details</h2>

              <span>
                #{order._id.slice(-8)}
              </span>
            </div>

            <div className="payment-order-items">

              {orderItems.length === 0 ? (
                <p>
                  No order items available.
                </p>
              ) : (
                orderItems.map((item, index) => {
                  const product =
                    item.product;

                  const price =
                    Number(
                      product?.price || 0
                    );

                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  const total =
                    price * quantity;

                  return (
                    <div
                      className="payment-item"
                      key={
                        product?._id ||
                        index
                      }
                    >
                      <div className="payment-item-image">
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={
                              product.name ||
                              "Product"
                            }
                          />
                        ) : (
                          <span>
                            No Image
                          </span>
                        )}
                      </div>

                      <div className="payment-item-info">
                        <h3>
                          {product?.name ||
                            "Product"}
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
                })
              )}
            </div>
          </div>

          {/* Payment Method */}

          <div className="payment-section">
            <h2>Select Payment Method</h2>

            <div className="payment-methods">

              {/* COD */}

              <label
                className={`payment-method ${
                  paymentMethod === "COD"
                    ? "active"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={
                    paymentMethod ===
                    "COD"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                />

                <div className="payment-method-content">
                  <div className="payment-method-title">
                    <span className="payment-method-icon">
                      💵
                    </span>

                    <div>
                      <h3>
                        Cash on Delivery
                      </h3>

                      <p>
                        Pay when your order
                        is delivered.
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              {/* Online */}

              <label
                className={`payment-method ${
                  paymentMethod === "ONLINE"
                    ? "active"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={
                    paymentMethod ===
                    "ONLINE"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                />

                <div className="payment-method-content">
                  <div className="payment-method-title">
                    <span className="payment-method-icon">
                      💳
                    </span>

                    <div>
                      <h3>
                        Online Payment
                      </h3>

                      <p>
                        Demo payment flow for
                        project testing.
                      </p>
                    </div>
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Demo Notice */}

          {paymentMethod ===
            "ONLINE" && (
            <div className="demo-notice">
              <strong>
                Demo Payment Mode
              </strong>

              <p>
                This project currently uses a
                simulated online payment flow.
                No real money is charged.
              </p>
            </div>
          )}
        </div>

        {/* ==========================
            Payment Summary
        ========================== */}

        <div className="payment-summary">

          <h2>Payment Summary</h2>

          <div className="payment-summary-row">
            <span>Order ID</span>

            <strong>
              #{order._id.slice(-8)}
            </strong>
          </div>

          <div className="payment-summary-row">
            <span>Payment Method</span>

            <strong>
              {paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Online Payment"}
            </strong>
          </div>

          <div className="payment-divider" />

          <div className="payment-total">
            <span>Total Amount</span>

            <strong>
              ₹
              {orderAmount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <button
            type="button"
            className="pay-now-btn"
            disabled={loading}
            onClick={handlePayment}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "COD"
              ? "Confirm COD Order"
              : "Pay Now"}
          </button>

          <button
            type="button"
            className="back-orders-btn"
            onClick={() =>
              navigate("/orders")
            }
          >
            View My Orders
          </button>

          <p className="payment-security">
            Secure checkout • Your order
            information is protected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Payment;