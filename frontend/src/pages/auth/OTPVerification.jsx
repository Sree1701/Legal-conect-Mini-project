import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";
import "./OTPVerification.css";

function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setRole(location.state.role || "client");
    } else {
      // Fallback if accessed directly without email in state
      const storedEmail = localStorage.getItem("pending_otp_email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [location]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // numeric only
    if (value.length <= 6) {
      setOtp(value);
      if (error) setError("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email address missing. Please login again.");
      return;
    }
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email: email,
        otp: otp,
      });

      if (response.data.success) {
        const { token, user, role: userRole } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("pending_otp_email");

        setSuccessMsg("OTP Verified Successfully! Redirecting to Dashboard...");

        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/admin/dashboard");
          } else if (userRole === "advocate") {
            navigate("/advocate");
          } else {
            navigate("/client");
          }
        }, 1200);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Invalid or Expired OTP code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await api.post("/auth/resend-otp", { email });
      if (response.data.success) {
        setSuccessMsg("A new 6-digit OTP code has been sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-container">
        <div className="auth-card otp-card">
          <div className="auth-header">
            <div className="otp-badge">
              <img src="/logo.png" alt="LegalConnect Logo" className="auth-badge-logo" /> Two-Factor Security
            </div>
            <h2>Verify Email OTP</h2>
            <p className="auth-subtitle">
              We have sent a 6-digit verification code to:
            </p>
            <div className="otp-email-display">{email || "your registered email"}</div>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {successMsg && <div className="auth-success-banner">{successMsg}</div>}

          <form onSubmit={handleVerify} className="auth-form">
            <div className="input-group">
              <label htmlFor="otp">Enter 6-Digit OTP Code</label>
              <div className="otp-input-wrapper">
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn otp-submit-btn"
              disabled={loading || otp.length < 6}
            >
              {loading ? "Verifying OTP Code..." : "Verify & Access Dashboard ➔"}
            </button>
          </form>

          <div className="otp-footer-actions">
            <p>
              Didn't receive the email?{" "}
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend OTP Code"}
              </button>
            </p>

            <div className="otp-back-link">
              <Link to="/login">← Back to Login</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OTPVerification;