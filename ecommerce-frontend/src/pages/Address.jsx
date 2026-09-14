import { useEffect, useState } from "react";
import axios from "axios";

function Address() {
  const [addresses, setAddresses] = useState([]);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/address",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddresses(response.data.addresses || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch addresses"
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/address",
        {
          fullName,
          mobile,
          addressLine,
          city,
          state,
          pincode,
          country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Address Added Successfully ✅");

      setFullName("");
      setMobile("");
      setAddressLine("");
      setCity("");
      setState("");
      setPincode("");
      setCountry("India");

      fetchAddresses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add address"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>My Addresses</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <h2>Add New Address</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Address"
          value={addressLine}
          onChange={(e) =>
            setAddressLine(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) =>
            setState(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Pincode"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) =>
            setCountry(e.target.value)
          }
        />

        <br />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Address"}
        </button>
      </form>

      <hr />

      <h2>Saved Addresses</h2>

      {addresses.length === 0 ? (
        <p>No Address Found</p>
      ) : (
        addresses.map((address) => (
          <div key={address._id}>
            <p>
              <strong>{address.fullName}</strong>
            </p>

            <p>{address.mobile}</p>

            <p>{address.addressLine}</p>

            <p>
              {address.city}, {address.state} -{" "}
              {address.pincode}
            </p>

            <p>{address.country}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Address;