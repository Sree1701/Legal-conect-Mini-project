import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Navigate to OTP Verification page for Requirement 8
        navigate("/otp", {
          state: {
            email: response.data.email || formData.email,
            role: response.data.role || "client",
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to connect to backend server. Please check your credentials and database.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <img src="/logo.png" alt="LegalConnect Logo" className="auth-badge-logo" /> LegalConnect
            </div>
            <h2>User Login</h2>
            <p className="auth-subtitle">
              Sign in to manage your legal consultations, cases, and documents.
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Verifying Credentials..." : "Continue to OTP Verification ➔"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-secondary-actions">
            <p>
              Don't have an account yet?{" "}
              <Link to="/register" className="auth-link">
                Register Here
              </Link>
            </p>

            <Link to="/advocate-login" className="advocate-portal-link">
              ⚖ Are you an Advocate? Login to Advocate Portal →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;