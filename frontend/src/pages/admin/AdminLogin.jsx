import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./AdminLogin.css";

function AdminLogin() {
  const location = useLocation();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
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

          {error && (
            <div className="auth-error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Admin Email Address</label>
              <div className="input-wrapper">
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
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter admin password"
                  required
                />
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn admin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span> Authenticating Admin...
                </>
              ) : (
                "Authenticate & Request OTP ➔"
              )}
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