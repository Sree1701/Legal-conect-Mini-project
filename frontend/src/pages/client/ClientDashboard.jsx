import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { bookAppointment } from "../../services/appointmentService";
import "./ClientDashboard.css";

function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [advocates, setAdvocates] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("advocates"); // 'advocates' | 'cases'
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State for New Case Registration
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [caseForm, setCaseForm] = useState({
    title: "",
    category: "Civil",
    description: "",
  });
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Modal State for Adding Document to existing case
  const [selectedCaseForUpload, setSelectedCaseForUpload] = useState(null);
  const [newDocument, setNewDocument] = useState({ name: "", fileData: "", size: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetchAdvocates();
    fetchClientCases(parsedUser.id || parsedUser._id);
  }, [navigate]);

  const fetchAdvocates = async () => {
    try {
      const res = await api.get("/users/advocates");
      if (res.data.success) {
        setAdvocates(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching advocates:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientCases = async (clientId) => {
    try {
      const res = await api.get(`/complaints/client/${clientId}`);
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openNewCaseModal = (advocate = null) => {
    setSelectedAdvocate(advocate);
    setCaseForm({ title: "", category: "Civil", description: "" });
    setDocuments([]);
    setMessage("");
    setShowCaseModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocuments((prev) => [
          ...prev,
          {
            name: file.name,
            url: event.target.result,
            size: `${(file.size / 1024).toFixed(1)} KB`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDoc = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleCaseSubmit = async (e) => {
    e.preventDefault();
    if (!caseForm.title || !caseForm.description) {
      setMessage("Please fill in case title and description.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        user: user.id || user._id,
        advocate: selectedAdvocate ? (selectedAdvocate._id || selectedAdvocate.id) : null,
        title: caseForm.title,
        category: caseForm.category,
        description: caseForm.description,
        documents: documents,
      };

      const res = await api.post("/complaints", payload);

if (res.data.success) {

    // Create Appointment Automatically

    if (selectedAdvocate) {

        await bookAppointment({

            client: user.id || user._id,

            advocate: selectedAdvocate._id || selectedAdvocate.id,

            issue: caseForm.title,

            description: caseForm.description

        });

    }

    setMessage("Case Registered & Consultation Request Sent Successfully!");

    fetchClientCases(user.id || user._id);

    setTimeout(() => {

        setShowCaseModal(false);

        setActiveTab("cases");

    }, 1200);

}
    } catch (err) {
      setMessage("Failed to submit case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSingleDocument = async (e) => {
    e.preventDefault();
    if (!newDocument.name || !newDocument.fileData) return;

    try {
      const res = await api.post(`/complaints/${selectedCaseForUpload._id}/upload`, {
        name: newDocument.name,
        url: newDocument.fileData,
        size: newDocument.size,
      });

      if (res.data.success) {
        fetchClientCases(user.id || user._id);
        setSelectedCaseForUpload(null);
        setNewDocument({ name: "", fileData: "", size: "" });
      }
    } catch (err) {
      alert("Failed to upload document");
    }
  };

  const handleAdditionalFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewDocument({
        name: file.name,
        fileData: event.target.result,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const filteredAdvocates = advocates.filter((adv) => {
    const matchesSearch =
      adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" ||
      adv.specialization.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard-wrapper">
      {/* HEADER NAVBAR */}
      <header className="dashboard-header">
        <div className="header-brand">
          <img src="/logo.png" alt="LegalConnect Logo" className="client-dashboard-logo-image" />
          <div>
            <h2>LegalConnect</h2>
            <p>Client Portal Dashboard</p>
          </div>
        </div>

        <div className="header-user-actions">
          <div className="user-pill">
            <span className="user-icon">👤</span>
            <span>Welcome, <strong>{user?.name || "Client"}</strong></span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout ➔
          </button>
        </div>
      </header>

      {/* DASHBOARD HERO BANNER */}
      <section className="dashboard-banner">
        <div className="banner-content">
          <h1>Find Verified Advocates & Manage Your Legal Cases</h1>
          <p>
            Browse top legal professionals, select an advocate for your legal matter,
            upload case files, and track progress all in one secure portal.
          </p>
          <div className="banner-stats">
            <div className="stat-card">
              <span className="stat-number">{advocates.length}</span>
              <span className="stat-label">Available Advocates</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{cases.length}</span>
              <span className="stat-label">My Registered Cases</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT NAVIGATION TABS */}
      <div className="dashboard-container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "advocates" ? "active" : ""}`}
            onClick={() => setActiveTab("advocates")}
          >
            👨‍⚖ Find Advocates ({filteredAdvocates.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => setActiveTab("cases")}
          >
            📂 My Cases &amp; Documents ({cases.length})
          </button>
          <button
            className="action-btn-gold"
            onClick={() => openNewCaseModal()}
          >
            + Register New Case
          </button>
        </div>

        {/* TAB 1: ADVOCATES DIRECTORY */}
        {activeTab === "advocates" && (
          <div className="tab-content">
            <div className="filter-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search advocate by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-filter">
                <label>Specialization:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Specializations</option>
                  <option value="Civil">Civil Law</option>
                  <option value="Criminal">Criminal Law</option>
                  <option value="Family">Family Law</option>
                  <option value="Property">Property & Real Estate</option>
                  <option value="Consumer">Consumer Protection</option>
                  <option value="Cyber">Cyber Law</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Loading verified advocates...</div>
            ) : filteredAdvocates.length === 0 ? (
              <div className="empty-state">
                <h3>No Advocates Found</h3>
                <p>Try adjusting your search query or specialization filter.</p>
              </div>
            ) : (
              <div className="advocates-grid">
                {filteredAdvocates.map((adv) => (
                  <div className="advocate-card" key={adv._id || adv.id}>
                    <div className="advocate-header">
                      <div className="advocate-avatar">⚖</div>
                      <div className="advocate-info">
                        <h3>{adv.name}</h3>
                        <span className="specialization-tag">
                          {adv.specialization || "General Legal Practice"}
                        </span>
                      </div>
                    </div>

                    <div className="advocate-body">
                      <p className="advocate-bio">{adv.bio || "Experienced advocate dedicated to handling legal matters with transparency and expertise."}</p>
                      <div className="advocate-details">
                        <div>
                          <strong>Bar Council ID:</strong> <span className="bar-id-pill">📜 {adv.barCouncilId || "N/A"}</span>
                        </div>
                        <div>
                          <strong>Enrollment Year:</strong> 📅 {adv.enrollmentYear || "N/A"}
                        </div>
                        <div>
                          <strong>Years of Experience:</strong> <strong style={{color: '#047857'}}>🎖 {adv.experience !== undefined ? adv.experience : (adv.enrollmentYear ? Math.max(0, new Date().getFullYear() - adv.enrollmentYear) : 0)} Years</strong>
                        </div>
                        <div>
                          <strong>Verification Status:</strong>{" "}
                          <span className={`status-pill status-${(adv.advocateStatus || "Pending Verification").toLowerCase().replace(/\s+/g, '-')}`}>
                            {adv.advocateStatus || "Pending Verification"}
                          </span>
                        </div>
                        <div>
                          <strong>Email:</strong> ✉ {adv.email}
                        </div>
                        {adv.phone && (
                          <div>
                            <strong>Phone:</strong> 📞 {adv.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="advocate-footer">
                      <button
                        className="select-advocate-btn"
                        onClick={() => openNewCaseModal(adv)}
                      >
                        Select Advocate &amp; Send File ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY REGISTERED CASES & DOCUMENTS */}
        {activeTab === "cases" && (
          <div className="tab-content">
            {cases.length === 0 ? (
              <div className="empty-state">
                <h3>No Cases Registered Yet</h3>
                <p>
                  You haven't registered any legal cases yet. Browse advocates to select an advocate and send your case documents.
                </p>
                <button
                  className="action-btn-gold margin-top"
                  onClick={() => setActiveTab("advocates")}
                >
                  Browse Advocates Now
                </button>
              </div>
            ) : (
              <div className="cases-list">
                {cases.map((c) => (
                  <div className="case-card" key={c._id}>
                    <div className="case-card-header">
                      <div>
                        <span className="case-category-badge">{c.category}</span>
                        <h3 className="case-title">{c.title}</h3>
                      </div>
                      <span className={`status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="case-description">{c.description}</p>

                    <div className="case-meta">
                      <div className="meta-item">
                        <strong>Assigned Advocate:</strong>{" "}
                        {c.advocate ? (
                          <span className="advocate-name-tag">
                            👨‍⚖ {c.advocate.name} ({c.advocate.specialization || "Advocate"})
                          </span>
                        ) : (
                          <span className="unassigned-tag">No Advocate Assigned</span>
                        )}
                      </div>
                      <div className="meta-item">
                        <strong>Submitted On:</strong>{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* UPLOADED DOCUMENTS SECTION */}
                    <div className="documents-section">
                      <div className="documents-header">
                        <h4>📄 Documents &amp; Files Sent ({c.documents?.length || 0})</h4>
                        <button
                          className="upload-doc-btn"
                          onClick={() => setSelectedCaseForUpload(c)}
                        >
                          + Send Additional Document
                        </button>
                      </div>

                      {c.documents && c.documents.length > 0 ? (
                        <div className="document-chips">
                          {c.documents.map((doc, idx) => (
                            <div className="doc-chip" key={idx}>
                              <span className="doc-icon">📎</span>
                              <div className="doc-details">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="doc-name"
                                  download={doc.name}
                                >
                                  {doc.name}
                                </a>
                                <span className="doc-size">{doc.size || "File"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-docs-text">
                          No document files attached yet. Click above to send files to your advocate.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* REGISTER NEW CASE MODAL */}
      {showCaseModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Register New Case &amp; Send Documents</h2>
              <button className="modal-close" onClick={() => setShowCaseModal(false)}>
                ✕
              </button>
            </div>

            {selectedAdvocate ? (
              <div className="selected-advocate-banner">
                <span>Selected Advocate:</span>
                <strong>👨‍⚖ {selectedAdvocate.name}</strong> ({selectedAdvocate.specialization})
              </div>
            ) : (
              <div className="select-advocate-dropdown">
                <label>Select Advocate (Optional):</label>
                <select
                  onChange={(e) => {
                    const adv = advocates.find((a) => (a._id || a.id) === e.target.value);
                    setSelectedAdvocate(adv || null);
                  }}
                  value={selectedAdvocate?._id || selectedAdvocate?.id || ""}
                >
                  <option value="">-- Choose an Advocate --</option>
                  {advocates.map((adv) => (
                    <option key={adv._id || adv.id} value={adv._id || adv.id}>
                      {adv.name} - {adv.specialization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {message && (
              <div className={message.includes("success") ? "auth-success-banner" : "auth-error-banner"}>
                {message}
              </div>
            )}

            <form onSubmit={handleCaseSubmit} className="modal-form">
              <div className="input-group">
                <label>Case Subject / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Property Dispute & Ownership Verification"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Legal Category</label>
                <select
                  value={caseForm.category}
                  onChange={(e) => setCaseForm({ ...caseForm, category: e.target.value })}
                >
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Family">Family</option>
                  <option value="Property">Property</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Cyber">Cyber</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Case Details &amp; Description *</label>
                <textarea
                  rows="4"
                  placeholder="Describe your legal concern, facts, and what assistance you require..."
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  required
                />
              </div>

              {/* FILE UPLOAD SECTION */}
              <div className="input-group">
                <label>Attach Legal Documents / Files for Advocate</label>
                <div className="file-upload-zone">
                  <input
                    type="file"
                    id="case-files"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <label htmlFor="case-files" className="file-upload-label">
                    📁 Click to Upload Files (PDF, Image, Word Docs)
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="upload-preview-list">
                    {documents.map((doc, i) => (
                      <div className="preview-chip" key={i}>
                        <span>📎 {doc.name} ({doc.size})</span>
                        <button
                          type="button"
                          className="remove-doc-btn"
                          onClick={() => handleRemoveDoc(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCaseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting Case..." : "Submit Case & Send Files"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD SINGLE DOCUMENT MODAL FOR EXISTING CASE */}
      {selectedCaseForUpload && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Send Additional Document to Advocate</h2>
              <button className="modal-close" onClick={() => setSelectedCaseForUpload(null)}>
                ✕
              </button>
            </div>
            <p className="modal-subtitle">
              Case: <strong>{selectedCaseForUpload.title}</strong>
            </p>

            <form onSubmit={handleUploadSingleDocument} className="modal-form">
              <div className="input-group">
                <label>Select File</label>
                <input
                  type="file"
                  onChange={handleAdditionalFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  required
                />
              </div>

              {newDocument.name && (
                <div className="file-summary">
                  <p><strong>Selected File:</strong> {newDocument.name} ({newDocument.size})</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedCaseForUpload(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Upload &amp; Send File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;