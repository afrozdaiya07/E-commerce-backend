import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* Fetch Users */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/admin");

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

  /* Change Role */
  const handleRoleChange = async (id, role) => {
    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await api.put(
        `/users/admin/${id}/role`,
        { role }
      );

      setMessage(
        response.data.message ||
          "User Role Updated Successfully ✅"
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

  /* Delete User */
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

      const response = await api.delete(
        `/users/admin/${id}`
      );

      setMessage(
        response.data.message ||
          "User Deleted Successfully ✅"
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

  /* Status */
  const getInitial = (name) => {
    return (name || "U")
      .charAt(0)
      .toUpperCase();
  };

  /* Loading */
  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-container">
          <div className="users-loading-card">
            <div className="users-loading-spinner"></div>

            <h2>Loading Users...</h2>

            <p>
              Please wait while we load all users.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* Responsive */
  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        {/* Header */}
        <div className="admin-users-header">
          <div>
            <span className="admin-users-label">
              ADMIN PANEL
            </span>

            <h1>User Management</h1>

            <p>
              Manage customer accounts and
              administrator roles.
            </p>
          </div>

          <div className="users-count-card">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="users-message users-error">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="users-message users-success">
            ✅ {message}
          </div>
        )}

        {/* Section Header */}
        <div className="users-section-header">
          <div>
            <h2>All Users</h2>

            <p>
              View account details and manage
              user permissions.
            </p>
          </div>

          <div className="users-total-badge">
            {users.length} Accounts
          </div>
        </div>

        {/* Users */}
        {users.length === 0 ? (
          <div className="no-users-card">
            <div className="empty-users-icon">
              👥
            </div>

            <h3>No Users Found</h3>

            <p>
              There are currently no users in
              your application.
            </p>
          </div>
        ) : (
          <div className="admin-users-grid">
            {users.map((user) => (
              <div
                className="admin-user-card"
                key={user._id}
              >
                {/* Card Header */}
                <div className="user-card-header">
                  <div className="user-profile">
                    <div className="user-avatar">
                      {getInitial(user.name)}
                    </div>

                    <div className="user-main-info">
                      <h3>
                        {user.name || "Unknown User"}
                      </h3>

                      <p>
                        {user.email ||
                          "No email available"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`user-role-badge ${
                      user.role === "admin"
                        ? "role-admin"
                        : "role-user"
                    }`}
                  >
                    {user.role === "admin"
                      ? "Admin"
                      : "User"}
                  </span>
                </div>

                {/* User Details */}
                <div className="user-details">
                  <div className="user-detail-row">
                    <span>User ID</span>

                    <strong title={user._id}>
                      {user._id}
                    </strong>
                  </div>

                  <div className="user-detail-row">
                    <span>Created</span>

                    <strong>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN")
                        : "Not Available"}
                    </strong>
                  </div>

                  <div className="user-detail-row">
                    <span>Current Role</span>

                    <strong>
                      {user.role === "admin"
                        ? "Administrator"
                        : "Customer"}
                    </strong>
                  </div>
                </div>

                {/* Role Update */}
                <div className="role-management">
                  <label htmlFor={`role-${user._id}`}>
                    Change User Role
                  </label>

                  <select
                    id={`role-${user._id}`}
                    value={user.role}
                    disabled={
                      updatingId === user._id
                    }
                    onChange={(e) =>
                      handleRoleChange(
                        user._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>

                  {updatingId === user._id && (
                    <div className="updating-user">
                      <span className="mini-spinner"></span>
                      Updating role...
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="user-card-actions">
                  <button
                    type="button"
                    className="delete-user-btn"
                    onClick={() =>
                      handleDelete(user._id)
                    }
                    disabled={
                      deletingId === user._id
                    }
                  >
                    {deletingId === user._id
                      ? "Deleting..."
                      : "Delete User"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;