import Navbar from "../components/Navbar";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
    return (
        <>
            <Navbar />

            <section className="hero">

                <h1>Legal Assistance Made Simple</h1>

                <p>
                    Connect with verified advocates, upload legal
                    documents, book consultations, track case progress,
                    and receive legal guidance from one secure platform.
                </p>

                <div className="buttons">

                    <Link to="/register">
                        <button className="primary">
                            Get Started
                        </button>
                    </Link>

                    <Link to="/login">
                        <button className="secondary">
                            Advocate Login
                        </button>
                    </Link>

                </div>

            </section>

            <section className="features">

                <div className="card">
                    <h3>👨‍⚖️ Verified Advocates</h3>
                    <p>Find trusted legal professionals.</p>
                </div>

                <div className="card">
                    <h3>📄 Secure Documents</h3>
                    <p>Upload and manage legal documents safely.</p>
                </div>

                <div className="card">
                    <h3>🤖 AI Assistance</h3>
                    <p>Get legal guidance before consultation.</p>
                </div>

                <div className="card">
                    <h3>📅 Online Booking</h3>
                    <p>Book appointments in just a few clicks.</p>
                </div>

            </section>

            <footer>

                © 2026 LegalConnect | MCA Mini Project

            </footer>

        </>
    );
}

export default Home;