import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="register-container">

      <div className="register-card">

        <h1>⚖ LegalConnect</h1>
        <h2>Create Your Account</h2>

        <form>

          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" placeholder="Enter your phone number" />
          </div>

          <div className="input-group">
            <label>Register As</label>

            <select>
              <option>Client</option>
              <option>Advocate</option>
            </select>

          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
            />
          </div>

          <button className="register-btn">
            Create Account
          </button>

        </form>

        <p className="login-link">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Register;