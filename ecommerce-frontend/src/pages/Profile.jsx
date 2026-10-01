import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers,
        }
      );

      const user = response.data.user;

      setProfile(user);
      setName(user.name || "");
      setEmail(user.email || "");
    } catch (error) {
      console.log(
        "Profile Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!name.trim()) {
        setError("Name is required");
        return;
      }

      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name: name.trim(),
          email: email.trim(),
        },
        {
          headers,
        }
      );

      const updatedUser = response.data.user;

      setProfile(updatedUser);
      setName(updatedUser.name || "");
      setEmail(updatedUser.email || "");

      setMessage(
        response.data.message ||
          "Profile updated successfully ✅"
      );
    } catch (error) {
      console.log(
        "Update Profile Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await axios.delete(
        "http://localhost:5000/api/users/profile",
        {
          headers,
        }
      );

      logout();
      navigate("/register");
    } catch (error) {
      console.log(
        "Delete Account Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  // Profile Not Found
  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <h2>Profile Not Found</h2>
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Go To Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account information.</p>
        </div>

        <button
          type="button"
          className="profile-orders-btn"
          onClick={() => navigate("/orders")}
        >
          My Orders
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="profile-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="profile-message success">
          {message}
        </div>
      )}

      <div className="profile-layout">
        {/* Profile Overview */}
        <div className="profile-overview">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <h2>{profile.name}</h2>
          <p>{profile.email}</p>

          <span
            className={`profile-role ${
              profile.role === "admin"
                ? "admin-role"
                : "user-role"
            }`}
          >
            {profile.role === "admin"
              ? "Admin"
              : "User"}
          </span>

          <div className="profile-info-list">
            <div>
              <span>Account Status</span>
              <strong>Active</strong>
            </div>

            <div>
              <span>Member Since</span>
              <strong>
                {profile.createdAt
                  ? new Date(
                      profile.createdAt
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="profile-form-card">
          <h2>Account Information</h2>

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >
            <div className="profile-form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Role</label>

              <input
                type="text"
                value={profile.role}
                disabled
                className="disabled-input"
              />
            </div>

            <button
              type="submit"
              className="save-profile-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className="profile-security-links">
            <button
              type="button"
              onClick={() => navigate("/change-password")}
            >
              Change Password →
            </button>

            <button
              type="button"
              onClick={() => navigate("/address")}
            >
              Manage Addresses →
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="profile-danger-zone">
        <div>
          <h2>Delete Account</h2>
          <p>
            Permanently delete your account and
            related account data.
          </p>
        </div>

        <button
          type="button"
          className="delete-account-btn"
          disabled={deleting}
          onClick={handleDeleteAccount}
        >
          {deleting
            ? "Deleting..."
            : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}

export default Profile;