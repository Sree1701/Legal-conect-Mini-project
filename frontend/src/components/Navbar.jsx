import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo-section">

        <img
          src="/logo.png"
          alt="LegalConnect Logo"
          className="logo-image"
        />

        <div className="logo-text">

          <h2>LegalConnect</h2>

          <p>
            A Web-Based Legal Assistance &
            <br />
            Case Management Portal
          </p>

        </div>

      </div>

      <nav className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/login">User Login</Link>

        <Link to="/register">Register</Link>

        <Link to="/advocate-login" className="advocate-btn">
          Advocate Portal
        </Link>

      </nav>

    </header>
  );
}

export default Navbar;