import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = response.data.user;

      setProfile(user);
      setName(user.name || "");
      setEmail(user.email || "");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      if (!name.trim() || !email.trim()) {
        setError("Name and Email are required");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name: name.trim(),
          email: email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.user);

      setName(response.data.user.name);
      setEmail(response.data.user.email);

      setMessage(
        response.data.message ||
          "Profile Updated Successfully ✅"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setUpdating(false);
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

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.delete(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Account Deleted Successfully ✅"
      );

      // Remove token and user from AuthContext
      logout();

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <h2>Loading Profile...</h2>;
  }

  if (error && !profile) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Profile</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {profile && (
        <div>
          <p>
            <strong>User ID:</strong>{" "}
            {profile._id}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {profile.role}
          </p>

          <hr />

          <h2>Update Profile</h2>

          <form onSubmit={handleUpdateProfile}>
            <div>
              <label>Name</label>
              <br />

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter Name"
              />
            </div>

            <br />

            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter Email"
              />
            </div>

            <br />

            <button
              type="submit"
              disabled={updating || deleting}
            >
              {updating
                ? "Updating..."
                : "Update Profile"}
            </button>
          </form>

          <hr />

          <h2>Danger Zone</h2>

          <p>
            Deleting your account will remove your
            account data.
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting || updating}
          >
            {deleting
              ? "Deleting Account..."
              : "Delete Account"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;