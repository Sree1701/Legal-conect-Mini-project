import { Link } from "react-router-dom";
import "./AdvocateLogin.css";

function AdvocateLogin() {
  return (
    <div className="advocate-login-container">

      <div className="advocate-login-card">

        <h1>⚖ LegalConnect</h1>

        <h2>Advocate Login</h2>

        <p className="subtitle">
          Login to manage your appointments and client cases.
        </p>

        <form>

          <div className="input-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
            />

          </div>

          <button className="login-btn">
            Login
          </button>

        </form>

        <div className="links">

          <Link to="/register">
            Register as Advocate
          </Link>

          <Link to="/forgot-password">
            Forgot Password?
          </Link>

        </div>

        <p className="back-home">
          <Link to="/">← Back to Home</Link>
        </p>

      </div>

    </div>
  );
}

export default AdvocateLogin;