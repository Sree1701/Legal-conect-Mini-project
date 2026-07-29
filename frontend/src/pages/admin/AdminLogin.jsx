import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./AdminLogin.css";

function AdminLogin() {
  const location = useLocation();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter administrator email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      if (response.data.success) {
        if (response.data.role && response.data.role !== "admin") {
          setError(
            `Access Denied: This account is registered as ${response.data.role.toUpperCase()}. Admin portal requires administrator privileges.`
          );
          return;
        }

        // Navigate to OTP Verification page for Requirement 8
        navigate("/otp", {
          state: {
            email: response.data.email || email,
            role: "admin",
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to connect to server. Please check MongoDB and admin credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <header className="standalone-admin-header">
        <div className="admin-header-brand">
          <img src="/logo.png" alt="LegalConnect Logo" className="admin-header-logo-image" />
          <div>
            <h2 className="admin-header-title">LegalConnect Admin Portal</h2>
            <p className="admin-header-subtitle">System Control &amp; Verification Services</p>
          </div>
        </div>
        <Link to="/" className="admin-exit-btn">
          Main Website ➔
        </Link>
      </header>

      <main className="auth-container admin-bg">
        <div className="auth-card admin-card">
          <div className="auth-header">
            <div className="admin-badge">
              <img src="/logo.png" alt="LegalConnect Logo" className="auth-badge-logo" /> Control Panel Login
            </div>
            <h2>Admin Portal Access</h2>
            <p className="auth-subtitle">
              Authorized access for system administration, advocate verification, and user management.
            </p>
          </div>

          <div className="admin-default-info-banner">
            <span>💡 <strong>Default Admin Credentials:</strong></span>
            <div>Email: <code>admin@gmail.com</code> | Password: <code>admin123</code></div>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Admin Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="admin@gmail.com"
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn admin-submit-btn"
              disabled={loading}
            >
              {loading ? "Authenticating Admin..." : "Authenticate & Request OTP ➔"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-secondary-actions">
            <Link to="/" className="auth-link">
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </main>

      <footer className="standalone-admin-footer">
        <p>© 2026 LegalConnect System Administration. Restricted Access Portal.</p>
      </footer>
    </div>
  );
}

export default AdminLogin;