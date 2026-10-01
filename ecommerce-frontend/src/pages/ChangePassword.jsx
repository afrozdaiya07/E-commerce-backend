import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  /* State */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* Token */
  const token = localStorage.getItem("token");

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("All password fields are required");
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "Password changed successfully ✅"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(
        "Change Password Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  /* Responsive */
  return (
    <div className="change-password-page">
      {/* Header */}
      <div className="change-password-header">
        <div>
          <h1>Change Password</h1>
          <p>Update your account password securely.</p>
        </div>

        <button
          type="button"
          className="back-profile-btn"
          onClick={() => navigate("/profile")}
        >
          ← Back To Profile
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="password-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="password-message success">
          {message}
        </div>
      )}

      {/* Main Card */}
      <div className="change-password-container">
        <div className="password-icon">🔐</div>

        <h2>Update Password</h2>

        <p className="password-subtitle">
          Enter your current password and choose a new password.
        </p>

        <form
          className="change-password-form"
          onSubmit={handleSubmit}
        >
          {/* Current Password */}
          <div className="password-form-group">
            <label htmlFor="currentPassword">
              Current Password
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New Password */}
          <div className="password-form-group">
            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="password-form-group">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              required
            />
          </div>

          {/* Password Rules */}
          <div className="password-rules">
            <strong>Password requirements</strong>

            <span>• At least 6 characters</span>
            <span>• New passwords must match</span>
          </div>

          <button
            type="submit"
            className="change-password-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;