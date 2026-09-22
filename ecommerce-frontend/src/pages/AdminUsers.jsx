import { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please Login First");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data.users || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/users/admin/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "User Role Updated Successfully"
      );

      await fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update user role"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/users/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "User Deleted Successfully"
      );

      await fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <h1>Admin User Management</h1>
        <h2>Loading Users...</h2>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <h1>Admin User Management</h1>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      <hr />

      <h2>All Users ({users.length})</h2>

      {users.length === 0 ? (
        <p>No Users Found</p>
      ) : (
        <div className="admin-users-grid">
          {users.map((user) => (
            <div
              className="admin-user-card"
              key={user._id}
            >
              <h3>{user.name}</h3>

              <p>
                <strong>Email:</strong>{" "}
                {user.email}
              </p>

              <p>
                <strong>User ID:</strong>{" "}
                {user._id}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(
                  user.createdAt
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {user.role}
              </p>

              <select
                value={user.role}
                disabled={updatingId === user._id}
                onChange={(e) =>
                  handleRoleChange(
                    user._id,
                    e.target.value
                  )
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              {updatingId === user._id && (
                <p>Updating...</p>
              )}

              <br />
              <br />

              <button
                type="button"
                onClick={() =>
                  handleDelete(user._id)
                }
                disabled={deletingId === user._id}
              >
                {deletingId === user._id
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;