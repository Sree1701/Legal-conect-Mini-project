import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <h2>⚖ LegalConnect</h2>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/advocate-login">Advocate</Link>
            </div>
        </nav>
    );
}

export default Navbar;