import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const [cartResponse, addressResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get("http://localhost:5000/api/address", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setCart(cartResponse.data.cart || []);
      setAddresses(addressResponse.data.addresses || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load checkout data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const placeOrder = async () => {
    try {
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      if (!selectedAddress) {
        setError("Please Select an Address");
        return;
      }

      if (cart.length === 0) {
        setError("Your Cart is Empty");
        return;
      }

      setPlacingOrder(true);

      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: orderItems,
          addressId: selectedAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Order Placed Successfully ✅");

      console.log("Order:", response.data.order);

      setTimeout(() => {
        navigate("/orders");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return <h2>Loading Checkout...</h2>;
  }

  return (
    <div>
      <h1>Checkout</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <h2>Select Address</h2>

      {addresses.length === 0 ? (
        <div>
          <p>No address found.</p>

          <button onClick={() => navigate("/address")}>
            Add Address
          </button>
        </div>
      ) : (
        addresses.map((address) => (
          <div key={address._id}>
            <label>
              <input
                type="radio"
                name="address"
                value={address._id}
                checked={selectedAddress === address._id}
                onChange={(e) =>
                  setSelectedAddress(e.target.value)
                }
              />

              {" "}
              <strong>{address.fullName}</strong>,{" "}
              {address.mobile}, {address.addressLine},{" "}
              {address.city}, {address.state} -{" "}
              {address.pincode}, {address.country}
            </label>
          </div>
        ))
      )}

      <hr />

      <h2>Order Summary</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        cart.map((item) => (
          <div key={item._id}>
            <h3>{item.product.name}</h3>

            <p>Price: ₹{item.product.price}</p>

            <p>Quantity: {item.quantity}</p>

            <p>
              Total: ₹
              {item.product.price * item.quantity}
            </p>

            <hr />
          </div>
        ))
      )}

      <h2>Subtotal: ₹{subtotal}</h2>

      <button
        onClick={placeOrder}
        disabled={placingOrder || cart.length === 0}
      >
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}

export default Checkout;