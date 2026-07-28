import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdvocateDashboard.css";

function AdvocateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("assigned"); // 'assigned' | 'all'
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected document for preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/advocate-login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetchAdvocateData(parsedUser.id || parsedUser._id);
  }, [navigate]);

  const fetchAdvocateData = async (advocateId) => {
    setLoading(true);
    try {
      // Fetch cases specifically assigned to this advocate
      const assignedRes = await api.get(`/complaints/advocate/${advocateId}`);
      if (assignedRes.data.success) {
        setCases(assignedRes.data.data);
      }

      // Fetch all cases registered in system
      const allRes = await api.get("/complaints");
      if (allRes.data.success) {
        setAllCases(allRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching advocate dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleUpdateStatus = async (caseId, newStatus) => {
    try {
      const res = await api.patch(`/complaints/${caseId}/status`, {
        status: newStatus,
        advocate: user.id || user._id,
      });

      if (res.data.success) {
        fetchAdvocateData(user.id || user._id);
      }
    } catch (err) {
      alert("Failed to update case status.");
    }
  };

  const handleAcceptCase = async (caseId) => {
    try {
      const res = await api.patch(`/complaints/${caseId}/status`, {
        advocate: user.id || user._id,
        status: "Assigned",
      });

      if (res.data.success) {
        alert("Case accepted and assigned to your dashboard!");
        fetchAdvocateData(user.id || user._id);
      }
    } catch (err) {
      alert("Failed to accept case.");
    }
  };

  const displayedCases = (viewTab === "assigned" ? cases : allCases).filter((c) => {
    if (statusFilter === "All") return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="advocate-dashboard-wrapper">
      {/* ADVOCATE DASHBOARD HEADER */}
      <header className="adv-header">
        <div className="adv-brand">
          <span className="adv-logo">👨‍⚖</span>
          <div>
            <h2>LegalConnect Portal</h2>
            <p>Advocate Case Management System</p>
          </div>
        </div>

        <div className="adv-user-controls">
          <div className="adv-user-badge">
            <span>Advocate: <strong>{user?.name || "Legal Counsel"}</strong></span>
          </div>
          <button className="adv-logout-btn" onClick={handleLogout}>
            Logout ➔
          </button>
        </div>
      </header>

      {/* ADVOCATE HERO STATS BANNER */}
      <section className="adv-hero-banner">
        <div className="adv-hero-content">
          <h1>Welcome, Counselor {user?.name || ""}</h1>
          <p>
            Review client case submissions, inspect legal documents and evidence files, and provide case progress updates.
          </p>

          <div className="adv-stats-row">
            <div className="adv-stat-box">
              <span className="adv-stat-val">{cases.length}</span>
              <span className="adv-stat-lbl">My Assigned Cases</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">
                {cases.filter((c) => c.status === "In Progress" || c.status === "Assigned").length}
              </span>
              <span className="adv-stat-lbl">Active Cases</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">{allCases.length}</span>
              <span className="adv-stat-lbl">Total Portal Cases</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="adv-main-container">
        {/* VIEW TABS & FILTERS */}
        <div className="adv-filter-header">
          <div className="adv-tabs">
            <button
              className={`adv-tab ${viewTab === "assigned" ? "active" : ""}`}
              onClick={() => setViewTab("assigned")}
            >
              💼 My Assigned Cases ({cases.length})
            </button>
            <button
              className={`adv-tab ${viewTab === "all" ? "active" : ""}`}
              onClick={() => setViewTab("all")}
            >
              🌐 All Portal Cases Registered ({allCases.length})
            </button>
          </div>

          <div className="adv-status-filter">
            <label>Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* CASES GRID */}
        {loading ? (
          <div className="adv-loading">Loading client cases...</div>
        ) : displayedCases.length === 0 ? (
          <div className="adv-empty">
            <h3>No Cases Found</h3>
            <p>
              {viewTab === "assigned"
                ? "You currently have no client cases assigned to your profile."
                : "No cases match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="adv-cases-grid">
            {displayedCases.map((c) => {
              const isAssignedToMe =
                c.advocate &&
                ((c.advocate._id || c.advocate.id) === (user.id || user._id));

              return (
                <div className="adv-case-card" key={c._id}>
                  <div className="adv-card-header">
                    <div>
                      <span className="adv-category-tag">{c.category} Law</span>
                      <h3 className="adv-case-title">{c.title}</h3>
                    </div>
                    <span className={`adv-status-pill status-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {c.status}
                    </span>
                  </div>

                  {/* CLIENT INFORMATION PANEL */}
                  <div className="adv-client-panel">
                    <span className="client-icon">👤</span>
                    <div>
                      <strong>Client:</strong> {c.user?.name || "Client"}
                      <div className="client-contact-info">
                        ✉ {c.user?.email || "N/A"} {c.user?.phone ? `| 📞 ${c.user.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <p className="adv-case-desc">{c.description}</p>

                  {/* CLIENT DOCUMENTS & FILES SECTION */}
                  <div className="adv-docs-box">
                    <div className="adv-docs-header">
                      <h4>📂 Client Documents &amp; Evidence Files ({c.documents?.length || 0})</h4>
                    </div>

                    {c.documents && c.documents.length > 0 ? (
                      <div className="adv-docs-list">
                        {c.documents.map((doc, idx) => (
                          <div className="adv-doc-item" key={idx}>
                            <span className="doc-type-icon">📄</span>
                            <div className="doc-info-text">
                              <span className="doc-title">{doc.name}</span>
                              <span className="doc-meta">{doc.size || "File"} • Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recently"}</span>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adv-view-doc-btn"
                              download={doc.name}
                            >
                              Open / Download ➔
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="adv-no-docs">No documents uploaded by client for this case yet.</p>
                    )}
                  </div>

                  {/* ADVOCATE ACTIONS FOOTER */}
                  <div className="adv-card-actions">
                    {!c.advocate ? (
                      <button
                        className="accept-case-btn"
                        onClick={() => handleAcceptCase(c._id)}
                      >
                        + Accept &amp; Assign to My Profile
                      </button>
                    ) : isAssignedToMe ? (
                      <div className="status-update-row">
                        <label>Update Case Status:</label>
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                        >
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    ) : (
                      <div className="assigned-other-info">
                        Assigned to: <strong>{c.advocate.name}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdvocateDashboard;