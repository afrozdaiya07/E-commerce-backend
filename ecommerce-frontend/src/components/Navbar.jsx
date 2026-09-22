import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          E-Commerce
        </Link>

        {/* Main Links */}
        <div className="navbar-links">

          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>

          {token && (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/orders">Orders</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/change-password">
                Change Password
              </Link>
            </>
          )}

          {token && user?.role === "admin" && (
            <>
              <Link to="/admin">
                Admin Dashboard
              </Link>

              <Link to="/admin/products">
                Manage Products
              </Link>

              <Link to="/admin/orders">
                Manage Orders
              </Link>

              <Link to="/admin/coupons">
                Manage Coupons
              </Link>

              <Link to="/admin/users">
                Manage Users
              </Link>
            </>
          )}

          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {token && (
            <div className="navbar-user">
              <span>
                Hello, {user?.name || "User"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;