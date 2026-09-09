import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <div>
        <Link to="/">E-Commerce</Link>
      </div>

      <div>
        <Link to="/">Home</Link>
        {" | "}
        <Link to="/products">Products</Link>
        {" | "}
        <Link to="/login">Login</Link>
        {" | "}
        <Link to="/register">Register</Link>
        {" | "}
        <Link to="/cart">Cart</Link>
      </div>
    </nav>
  );
}

export default Navbar;