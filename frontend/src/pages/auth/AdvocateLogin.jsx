import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import "./AdvocateLogin.css";

function AdvocateLogin() {
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
      setError("Please enter your advocate email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      if (user.role !== "advocate") {
        setError(
          `This account is registered as a ${user.role.toUpperCase()}. Please use the User Login page.`
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/advocate");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to connect to server. Please check your credentials and database.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-container advocate-bg">
        <div className="auth-card advocate-card">
          <div className="auth-header">
            <div className="advocate-badge">👨‍⚖ Advocate Portal</div>
            <h2>Advocate Portal Login</h2>
            <p className="auth-subtitle">
              Login to manage client consultations, review case files, and update hearing status.
            </p>
          </div>

          <div className="advocate-benefits-box">
            <div className="benefit-item">
              <span className="benefit-icon">✔</span> Verified Advocate Dashboard
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📅</span> Real-time Consultation Bookings
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span> Secure Client File Access
            </div>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Advocate Email Address</label>
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
              className="auth-submit-btn advocate-btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying Portal Access..." : "Login to Advocate Portal"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-secondary-actions">
            <p>
              Not registered as an advocate yet?{" "}
              <Link to="/register" className="auth-link">
                Register as Advocate
              </Link>
            </p>

            <Link to="/login" className="user-portal-link">
              ← Switch to User Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdvocateLogin;