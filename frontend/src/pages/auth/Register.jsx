import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    barCouncilId: "",
    enrollmentYear: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.role === "advocate") {
      if (!formData.barCouncilId || !formData.enrollmentYear) {
        setError("Bar Council ID and Year of Enrollment are required for advocates.");
        return;
      }
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.enrollmentYear, 10);
      if (isNaN(year) || year < 1950 || year > currentYear) {
        setError(`Please enter a valid Year of Enrollment between 1950 and ${currentYear}.`);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        name: formData.name,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        barCouncilId: formData.barCouncilId,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear, 10) : null,
        password: formData.password,
      });

      setSuccess(
        response.data.message || "Account created successfully! Redirecting to login..."
      );
      setTimeout(() => {
        if (formData.role === "advocate") {
          navigate("/advocate-login");
        } else {
          navigate("/login");
        }
      }, 1800);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Registration failed. Please check your connection to the server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-badge">
              <img src="/logo.png" alt="LegalConnect Logo" className="auth-badge-logo" /> LegalConnect
            </div>
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">
              Join LegalConnect to access verified legal guidance and services.
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {success && <div className="auth-success-banner">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📞</span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Register As *</label>
              <div className="input-wrapper">
                <span className="input-icon">🏛</span>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="client">Client (Seeking Legal Help)</option>
                  <option value="advocate">Advocate (Legal Professional)</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL ADVOCATE FIELDS */}
            {formData.role === "advocate" && (
              <>
                <div className="input-group advocate-extra-field">
                  <label htmlFor="barCouncilId">Bar Council ID *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📜</span>
                    <input
                      id="barCouncilId"
                      type="text"
                      name="barCouncilId"
                      value={formData.barCouncilId}
                      onChange={handleChange}
                      placeholder="e.g. MAH/1234/2020 or State Bar ID"
                      required={formData.role === "advocate"}
                    />
                  </div>
                </div>

                <div className="input-group advocate-extra-field">
                  <label htmlFor="enrollmentYear">Year of Enrollment *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>
                    <input
                      id="enrollmentYear"
                      type="number"
                      name="enrollmentYear"
                      value={formData.enrollmentYear}
                      onChange={handleChange}
                      placeholder="e.g. 2018"
                      min="1950"
                      max={new Date().getFullYear()}
                      required={formData.role === "advocate"}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min 6 chars)"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-secondary-actions">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;