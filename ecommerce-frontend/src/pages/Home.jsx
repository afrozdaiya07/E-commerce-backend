import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            Welcome to our store
          </span>

          <h1>
            Shop Smart.
            <br />
            Live Better.
          </h1>

          <p>
            Discover quality products at great
            prices. Find everything you need
            in one place.
          </p>

          <div className="hero-actions">
            <Link
              to="/products"
              className="hero-primary-btn"
            >
              Shop Now
            </Link>

            <Link
              to="/products"
              className="hero-secondary-btn"
            >
              Explore Products
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-product-card">
            <div className="hero-product-icon">
              🛍️
            </div>

            <h3>Quality Products</h3>

            <p>Simple shopping experience</p>
          </div>

          <div className="hero-floating-card top-card">
            <strong>Fast</strong>
            <span>Shopping</span>
          </div>

          <div className="hero-floating-card bottom-card">
            <strong>Secure</strong>
            <span>Checkout</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-heading">
          <span>Why Choose Us</span>

          <h2>
            Everything you need for easy shopping
          </h2>

          <p>
            A simple, secure and convenient
            shopping experience.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>

            <h3>Fast Delivery</h3>

            <p>
              Get your orders delivered quickly
              and conveniently.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>

            <h3>Secure Shopping</h3>

            <p>
              Your account and order information
              are protected.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>

            <h3>Easy Payment</h3>

            <p>
              Choose the payment option that
              works best for you.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>

            <h3>Quality Products</h3>

            <p>
              Explore products with reviews and
              ratings.
            </p>
          </div>
        </div>
      </section>

      {/* Shopping CTA */}
      <section className="shopping-cta">
        <div>
          <span>Start Shopping Today</span>

          <h2>
            Find your next favorite product.
          </h2>

          <p>
            Browse our collection and discover
            products made for your everyday needs.
          </p>
        </div>

        <Link
          to="/products"
          className="cta-btn"
        >
          View Products →
        </Link>
      </section>
    </div>
  );
}

export default Home;