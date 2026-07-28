import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Temporary login
        if (username === "admin123" && password === "123") {

            localStorage.setItem("adminLoggedIn", "true");

            navigate("/admin/dashboard");

        } else {
            alert("Invalid Username or Password");
        }
    };

    return (

        <div className="admin-login-container">

            <div className="admin-login-card">

                <img
                    src="/log.png"
                    alt="LegalConnect"
                    className="admin-logo"
                />

                <h2>Admin Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

            </div>

        </div>

    );

}

export default AdminLogin;