import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="overlay">
          <span className="hero-badge">⚖ INDIA'S PREMIER DIGITAL LEGAL PORTAL</span>
          <h1>LegalConnect Portal</h1>
          <h2>
            Empowering Citizens with Verified Legal Experts &amp; Instant Video Consultations
          </h2>

          <p>
            LegalConnect is a state-of-the-art online legal ecosystem that seamlessly connects citizens
            with certified advocates. Request live video consultations, securely upload case documents,
            track court hearings, and consult our 24/7 AI Legal Assistant—all in one place.
          </p>

          <div className="buttons">
            <Link to="/register">
              <button className="primary shadow-lg">
                🚀 Get Started Now
              </button>
            </Link>

            <Link to="/login">
              <button className="secondary">
                👨‍💼 Client Login
              </button>
            </Link>

            <Link to="/advocate-login">
              <button className="gold-outline-btn">
                👨‍⚖ Advocate Portal
              </button>
            </Link>

            <Link to="/admin">
              <button className="admin-access-btn">
                🛡 Admin Panel
              </button>
            </Link>
          </div>

          {/* HERO STATS BAR */}
          <div className="hero-stats-row mt-5">
            <div className="hero-stat-item">
              <span className="stat-num">500+</span>
              <span className="stat-desc">Verified Advocates</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">10,000+</span>
              <span className="stat-desc">Cases &amp; Hearings</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-desc">Secure Video Calls</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">24/7</span>
              <span className="stat-desc">AI Legal Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works">
        <div className="section-title-container">
          <span className="section-sub">SIMPLE 4-STEP PROCESS</span>
          <h2>How LegalConnect Works</h2>
          <p>Experience effortless legal representation from consultation booking to court case resolution.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>🔍 Search &amp; Filter Advocates</h3>
            <p>Browse top-rated advocates by specialization (Civil, Criminal, Family, Cyber, Property) and view hourly consultation fees.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>📅 Book &amp; Pay Fee</h3>
            <p>Select preferred meeting slots or request custom video consultations. Complete secure fee payment in seconds.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>👨‍⚖ Advocate Payment Check &amp; Link Approval</h3>
            <p>Advocate verifies client payment, confirms meeting time, and approves the secure video conference link.</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>🎥 Join Live Call &amp; Track Case</h3>
            <p>Access your unlocked video conference link in "My Cases &amp; Documents", join online hearings, and track document uploads.</p>
          </div>
        </div>
      </section>

      {/* FEATURES / SERVICES SECTION */}
      <section className="features">
        <div className="section-title-container">
          <span className="section-sub">COMPREHENSIVE LEGAL SUITE</span>
          <h2>Our Core Legal Services</h2>
        </div>

        <div className="feature-grid">
          <div className="card">
            <div className="card-icon">👨‍⚖</div>
            <h3>Verified Advocates</h3>
            <p>
              Access credentials, Bar Council enrollment details, years of experience, and transparent hourly fee structures for verified lawyers.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🎥</div>
            <h3>Live Video Consultations</h3>
            <p>
              Conduct face-to-face online video meetings with advocates via encrypted Jitsi meeting rooms with instant link unlocking.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">📂</div>
            <h3>My Cases &amp; Documents</h3>
            <p>
              Centralized dashboard to upload case files, review advocate legal notes, track hearing dates, and access approved call links.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">📄</div>
            <h3>Secure Document Vault</h3>
            <p>
              Safely store, download, and share evidence, affidavits, and petitions directly with assigned legal counsel.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🤖</div>
            <h3>24/7 AI Legal Advisor</h3>
            <p>
              Ask legal questions on Indian law, procedure, and statutes, receiving immediate structured advice and procedural next steps.
            </p>
          </div>

          <div className="card">
            <div className="card-icon">🔔</div>
            <h3>Instant Audit &amp; Status Logs</h3>
            <p>
              Stay informed with real-time updates on advocate responses, hearing schedules, payment confirmations, and system activity logs.
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="about">
        <div className="section-title-container">
          <span className="section-sub">THE LEGALCONNECT ADVANTAGE</span>
          <h2>Why Choose LegalConnect?</h2>
        </div>

        <div className="about-content">
          <div className="about-card">
            <div className="about-icon">🛡</div>
            <h3>Strict Bar Verification</h3>
            <p>
              Every advocate profile undergoes mandatory Bar Council ID verification by system administrators before approval.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🔒</div>
            <h3>Encrypted Confidentiality</h3>
            <p>
              Your legal documents, consultation notes, and video conference communications are protected with end-to-end security.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">⚡</div>
            <h3>Real-Time Payment Verification</h3>
            <p>
              Instant automated payment verification unlocks video conference links seamlessly upon advocate approval.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;