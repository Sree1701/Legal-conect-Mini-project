import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <Navbar />

      {/* HERO SECTION */}

      <section className="hero">

        <div className="overlay">

          <h1>LegalConnect</h1>

          <h2>
            A Web-Based Legal Assistance &
            <br />
            Case Management Portal
          </h2>

          <p>
            LegalConnect is a secure online platform that connects citizens
            with verified advocates. Users can book legal consultations,
            upload documents, track case progress, receive notifications,
            and access AI-assisted legal guidance—all in one place.
          </p>

          <div className="buttons">

            <Link to="/register">
              <button className="primary">
                Get Started
              </button>
            </Link>

            <Link to="/login">
              <button className="secondary">
                User Login
              </button>
            </Link>

            <Link to="/advocate-login">
              <button className="secondary">
                Advocate Portal
              </button>
            </Link>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="features">

        <h2>Our Services</h2>

        <div className="feature-grid">

          <div className="card">
            <h3>👨‍⚖ Verified Advocates</h3>
            <p>
              Connect with trusted and verified legal professionals based on
              specialization and availability.
            </p>
          </div>

          <div className="card">
            <h3>📅 Appointment Booking</h3>
            <p>
              Book online consultations with advocates quickly and securely.
            </p>
          </div>

          <div className="card">
            <h3>📂 Case Management</h3>
            <p>
              Track every stage of your legal complaint and case from a
              centralized dashboard.
            </p>
          </div>

          <div className="card">
            <h3>📄 Secure Document Upload</h3>
            <p>
              Store and access important legal documents safely anytime.
            </p>
          </div>

          <div className="card">
            <h3>🤖 AI Legal Assistance</h3>
            <p>
              Get preliminary legal guidance before consulting an advocate.
            </p>
          </div>

          <div className="card">
            <h3>🔔 Notifications</h3>
            <p>
              Stay informed with instant updates about appointments and case
              progress.
            </p>
          </div>

        </div>

      </section>

      {/* WHY CHOOSE US */}

      <section className="about">

        <h2>Why Choose LegalConnect?</h2>

        <div className="about-content">

          <div>

            <h3>✔ Trusted Legal Platform</h3>

            <p>
              All advocates are verified before joining the platform,
              ensuring trustworthy legal assistance.
            </p>

          </div>

          <div>

            <h3>✔ Secure Digital Records</h3>

            <p>
              Your legal documents and complaint details are stored securely
              and accessible whenever you need them.
            </p>

          </div>

          <div>

            <h3>✔ Fast Case Updates</h3>

            <p>
              Receive notifications regarding appointments, complaints,
              advocate responses, and case status.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <Footer />

    </>
  );
}

export default Home;