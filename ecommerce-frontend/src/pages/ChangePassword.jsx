import { useState } from "react";
import axios from "axios";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      if (!oldPassword || !newPassword || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (newPassword.length < 6) {
        setError(
          "New password must be at least 6 characters"
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New Passwords do not match");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Password Changed Successfully ✅"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Change Password</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <form onSubmit={handleChangePassword}>
        <div>
          <label>Old Password</label>
          <br />

          <input
            type="password"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(e.target.value)
            }
            placeholder="Enter Old Password"
          />
        </div>

        <br />

        <div>
          <label>New Password</label>
          <br />

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="Enter New Password"
          />
        </div>

        <br />

        <div>
          <label>Confirm New Password</label>
          <br />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm New Password"
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Changing..."
            : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;