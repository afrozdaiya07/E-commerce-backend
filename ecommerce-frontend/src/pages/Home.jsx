import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-small-title">
            Welcome to E-Commerce
          </p>

          <h1>
            Find Your Favorite
            <br />
            Products Here
          </h1>

          <p>
            Explore quality products at great
            prices and enjoy a simple shopping
            experience.
          </p>

          <Link to="/products">
            <button className="shop-button">
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🚚 Fast Delivery</h3>
            <p>
              Get your orders delivered quickly
              to your doorstep.
            </p>
          </div>

          <div className="feature-card">
            <h3>🔒 Secure Payment</h3>
            <p>
              Safe and secure payment experience
              for every order.
            </p>
          </div>

          <div className="feature-card">
            <h3>⭐ Quality Products</h3>
            <p>
              Discover products from trusted
              brands.
            </p>
          </div>
        </div>
      </section>

      {/* Shopping CTA */}
      <section className="shop-section">
        <h2>Ready to Shop?</h2>

        <p>
          Browse our products and add your
          favorites to the cart.
        </p>

        <Link to="/products">
          <button>
            Explore Products
          </button>
        </Link>
      </section>
    </div>
  );
}

export default Home;