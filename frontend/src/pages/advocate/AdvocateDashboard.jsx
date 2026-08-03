import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  getAdvocateAppointments,
  assignSlot,
  rejectAppointment,
  completeAppointment,
} from "../../services/appointmentService";
import "./AdvocateDashboard.css";

function AdvocateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'cases' | 'appointments' | 'profile'
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilterAppt, setStatusFilterAppt] = useState("All");
  const [statusFilterCase, setStatusFilterCase] = useState("All");

  // Case Hearing Slot Allocation Modal State (Slot assigned directly under each case)
  const [selectedCaseForSlot, setSelectedCaseForSlot] = useState(null);
  const [caseSlotForm, setCaseSlotForm] = useState({
    hearingDate: "",
    hearingTime: "",
    duration: 30,
    consultationFee: 500,
    meetingLink: "",
    advocateNotes: "",
    status: "Hearing Scheduled",
  });

  // Slot Assignment Modal State (for Consultation Request approval)
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    duration: 30,
    consultationFee: "",
    meetingLink: "",
    advocateNotes: "",
  });

  // Case Document Upload Modal State
  const [selectedCaseForUpload, setSelectedCaseForUpload] = useState(null);
  const [newDocument, setNewDocument] = useState({ name: "", fileData: "", size: "" });

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    specialization: "",
    bio: "",
    officeAddress: "",
    consultationFee: "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/advocate-login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const advId = parsedUser.id || parsedUser._id || parsedUser.user?.id || parsedUser.user?._id;
      if (advId) {
        fetchDashboardData(advId);
      }
    } catch (e) {
      navigate("/advocate-login");
    }
  }, [navigate]);

  const fetchDashboardData = async (advocateId) => {
    if (!advocateId) return;
    setLoading(true);

    try {
      // Fetch Advocate Appointments
      try {
        const apptRes = await getAdvocateAppointments(advocateId);
        if (apptRes?.data?.success) {
          setAppointments(apptRes.data.appointments || []);
        }
      } catch (errAppt) {
        console.error("Error fetching advocate appointments:", errAppt);
      }

      // Fetch Assigned Cases/Complaints
      try {
        const caseRes = await api.get(`/complaints/advocate/${advocateId}`);
        if (caseRes?.data?.success) {
          setCases(caseRes.data.data || []);
        }
      } catch (errCase) {
        console.error("Error fetching assigned cases:", errCase);
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

  // Open Case Hearing Slot Scheduling Modal
  const openCaseSlotModal = (c) => {
    setSelectedCaseForSlot(c);
    const defaultGitter = `https://gitter.im/LegalConnect-Case-${c._id}`;
    setCaseSlotForm({
      hearingDate: c.hearingDate || new Date().toISOString().split("T")[0],
      hearingTime: c.hearingTime || "10:00 AM",
      duration: c.duration || 30,
      consultationFee: c.consultationFee || user?.consultationFee || 500,
      meetingLink: c.meetingLink || defaultGitter,
      advocateNotes: c.advocateNotes || "",
      status: c.status === "Pending" || c.status === "Assigned" ? "Hearing Scheduled" : c.status,
    });
  };

  // Save Case Hearing Slot & Gitter Link
  const handleSaveCaseSlotSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseForSlot) return;

    try {
      const res = await api.put(`/complaints/${selectedCaseForSlot._id}`, caseSlotForm);
      if (res.data.success) {
        alert("Case Hearing Slot & Gitter Online Meeting Link Scheduled Successfully!");
        setSelectedCaseForSlot(null);
        fetchDashboardData(user.id || user._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule case slot.");
    }
  };

  // Open Appointment Slot Allocation Modal
  const openSlotModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSlotForm({
      appointmentDate: appointment.appointmentDate || "",
      appointmentTime: appointment.appointmentTime || "",
      duration: appointment.duration || 30,
      consultationFee: appointment.consultationFee || user?.consultationFee || 500,
      meetingLink: appointment.meetingLink || `https://gitter.im/LegalConnect-Consultation-${appointment._id}`,
      advocateNotes: appointment.advocateNotes || "",
    });
    setShowSlotModal(true);
  };

  // Submit Appointment Slot Assignment
  const handleAssignSlotSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const res = await assignSlot(selectedAppointment._id, slotForm);
      if (res.data.success) {
        alert("Consultation Slot Assigned & Approved Successfully!");
        setShowSlotModal(false);
        setSelectedAppointment(null);
        fetchDashboardData(user.id || user._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign consultation slot.");
    }
  };

  // Reject Appointment Request
  const handleRejectAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to decline this consultation request?")) return;
    try {
      const res = await rejectAppointment(apptId);
      if (res.data.success) {
        alert("Appointment request rejected.");
        fetchDashboardData(user.id || user._id);
      }
    } catch (err) {
      alert("Failed to reject appointment.");
    }
  };

  // Complete Appointment Request
  const handleCompleteAppointment = async (apptId) => {
    try {
      const res = await completeAppointment(apptId);
      if (res.data.success) {
        alert("Consultation marked as Completed!");
        fetchDashboardData(user.id || user._id);
      }
    } catch (err) {
      alert("Failed to mark appointment completed.");
    }
  };

  // Update Case Status directly
  const handleUpdateCaseStatus = async (caseId, newStatus) => {
    try {
      const res = await api.put(`/complaints/${caseId}`, { status: newStatus });
      if (res.data.success) {
        alert(`Case status updated to '${newStatus}'`);
        fetchDashboardData(user.id || user._id);
      }
    } catch (err) {
      alert("Failed to update case status");
    }
  };

  // Upload Document to Case
  const handleUploadCaseDocument = async (e) => {
    e.preventDefault();
    if (!newDocument.name || !newDocument.fileData || !selectedCaseForUpload) return;

    try {
      const res = await api.post(`/complaints/${selectedCaseForUpload._id}/upload`, {
        name: newDocument.name,
        url: newDocument.fileData,
        size: newDocument.size,
      });

      if (res.data.success) {
        alert("Document uploaded to client case successfully!");
        fetchDashboardData(user.id || user._id);
        setSelectedCaseForUpload(null);
        setNewDocument({ name: "", fileData: "", size: "" });
      }
    } catch (err) {
      alert("Failed to upload document to case.");
    }
  };

  const handleDocumentFileChange = (e) => {
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

  // Open Edit Profile Modal
  const openProfileModal = () => {
    setProfileForm({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
      specialization: user?.specialization || "General Legal Practice",
      bio: user?.bio || "",
      officeAddress: user?.officeAddress || "",
      consultationFee: user?.consultationFee || 0,
    });
    setProfileMessage("");
    setShowProfileModal(true);
  };

  // Submit Profile Edit Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/users/profile/${user.id || user._id}`, profileForm);
      if (res.data.success) {
        setProfileMessage("Profile updated successfully!");
        const updatedUser = { ...user, ...res.data.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setTimeout(() => {
          setShowProfileModal(false);
        }, 1000);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilterAppt === "All") return true;
    return a.status === statusFilterAppt;
  });

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    if (statusFilterCase === "All") return true;
    return c.status === statusFilterCase;
  });

  const pendingRequestsCount = appointments.filter((a) => a.status === "Pending").length;
  const scheduledCasesCount = cases.filter((c) => c.hearingDate || c.status === "Hearing Scheduled").length;

  return (
    <div className="adv-dashboard-wrapper">
      {/* HEADER NAVBAR */}
      <header className="adv-header">
        <div className="adv-brand">
          <img src="/logo.png" alt="LegalConnect Logo" className="adv-logo-img" />
          <div>
            <h2>LegalConnect</h2>
            <p>Advocate Portal Dashboard</p>
          </div>
        </div>

        <div className="adv-user-controls">
          <div className="adv-user-badge">
            <span className="user-icon">👨‍⚖</span>
            <span>
              Advocate: <strong>{user?.fullName || user?.name || "Advocate"}</strong>
            </span>
            <span
              className={`status-pill status-${(user?.advocateStatus || "Pending Verification")
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {user?.advocateStatus || "Pending Verification"}
            </span>
          </div>

          <button className="adv-logout-btn" onClick={handleLogout}>
            Logout ➔
          </button>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="adv-hero-banner">
        <div className="adv-hero-content">
          <h1>Advocate Case Management &amp; Hearing Slot Portal</h1>
          <p>
            Schedule hearing slots and Gitter online consultation rooms directly under each assigned case, review client case files, and update progress in real-time.
          </p>

          <div className="adv-stats-row">
            <div className="adv-stat-box">
              <span className="adv-stat-val">{cases.length}</span>
              <span className="adv-stat-lbl">Assigned Cases</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">{scheduledCasesCount}</span>
              <span className="adv-stat-lbl">Scheduled Hearing Slots</span>
            </div>
            <div className="adv-stat-box warning-box">
              <span className="adv-stat-val">{pendingRequestsCount}</span>
              <span className="adv-stat-lbl">Pending Requests</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">
                {user?.experience !== undefined ? user?.experience : (user?.enrollmentYear ? Math.max(0, new Date().getFullYear() - user.enrollmentYear) : 0)} Yrs
              </span>
              <span className="adv-stat-lbl">Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER & TABS */}
      <main className="adv-main-container">
        <div className="adv-tabs-nav">
          <button
            className={`adv-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 System Overview
          </button>

          <button
            className={`adv-tab-btn ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => setActiveTab("cases")}
          >
            📂 Assigned Cases &amp; Hearing Slots ({cases.length})
          </button>

          <button
            className={`adv-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            📋 Consultation Requests ({appointments.length})
          </button>

          <button
            className={`adv-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Advocate Profile
          </button>
        </div>

        {loading ? (
          <div className="adv-loading-state">Loading advocate portal data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="adv-section">
                {user?.advocateStatus === "Pending Verification" && (
                  <div className="adv-notice-banner">
                    ⚠️ <strong>Notice:</strong> Your Bar Council ID (<strong>{user?.barCouncilId || "N/A"}</strong>) is currently <strong>Pending Admin Verification</strong>. Once verified, your profile will be highlighted as a Verified Advocate on the platform.
                  </div>
                )}

                <h3 className="section-title">📊 Advocate Activity Summary</h3>

                <div className="adv-overview-grid">
                  <div className="adv-overview-card highlight-card">
                    <div className="card-icon-header">
                      <span className="card-emoji">📂</span>
                      <h4>Assigned Cases &amp; Slots</h4>
                    </div>
                    <p className="card-big-number">{cases.length} Cases</p>
                    <p className="card-subtext">
                      {scheduledCasesCount} cases have scheduled hearing slots and Gitter rooms.
                    </p>
                    <button
                      className="adv-card-action-btn gold-btn"
                      onClick={() => setActiveTab("cases")}
                    >
                      Manage Case Slots &amp; Documents →
                    </button>
                  </div>

                  <div className="adv-overview-card">
                    <div className="card-icon-header">
                      <span className="card-emoji">📋</span>
                      <h4>Consultation Queue</h4>
                    </div>
                    <p className="card-big-number">{pendingRequestsCount}</p>
                    <p className="card-subtext">
                      Direct client appointment requests waiting for slot allotment
                    </p>
                    <button
                      className="adv-card-action-btn"
                      onClick={() => setActiveTab("appointments")}
                    >
                      View Appointments Queue →
                    </button>
                  </div>

                  <div className="adv-overview-card">
                    <div className="card-icon-header">
                      <span className="card-emoji">👤</span>
                      <h4>Advocate Credentials</h4>
                    </div>
                    <p className="card-big-number">₹{user?.consultationFee || 500}</p>
                    <p className="card-subtext">
                      Default fee | {user?.specialization || "General Practice"}
                    </p>
                    <button
                      className="adv-card-action-btn"
                      onClick={() => setActiveTab("profile")}
                    >
                      View &amp; Edit Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ASSIGNED CASES & CASE-BOUND HEARING SLOTS TAB */}
            {activeTab === "cases" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <div>
                    <h3 className="section-title">📂 Assigned Client Cases &amp; Hearing Slots</h3>
                    <p className="section-subtitle">
                      Assign hearing dates, times, advocate notes, and Gitter meeting links directly under each client case.
                    </p>
                  </div>
                  <div className="filter-controls">
                    <label>Filter Case Status:</label>
                    <select
                      className="adv-select"
                      value={statusFilterCase}
                      onChange={(e) => setStatusFilterCase(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Hearing Scheduled">Hearing Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {filteredCases.length === 0 ? (
                  <div className="adv-empty-state">
                    <h3>No Cases Assigned Yet</h3>
                    <p>When clients select you as their advocate, their cases will appear here for hearing slot assignment.</p>
                  </div>
                ) : (
                  <div className="adv-cases-list">
                    {filteredCases.map((c) => (
                      <div className="adv-case-card" key={c._id}>
                        <div className="adv-case-card-header">
                          <div>
                            <span className="category-badge">{c.category}</span>
                            <h3 className="case-title">{c.title}</h3>
                            <p className="case-client-info">
                              👤 Client: <strong>{c.user?.fullName || c.user?.name || "Client"}</strong> ({c.user?.email || "No Email"} {c.user?.phone ? `| 📞 ${c.user.phone}` : ""})
                            </p>
                          </div>
                          <span
                            className={`status-badge status-${(c.status || "Assigned")
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <p className="case-description">{c.description}</p>

                        {/* CASE-BOUND HEARING & CONSULTATION SLOT DISPLAY */}
                        <div className="case-slot-display-box">
                          <div className="slot-box-header">
                            <h4>📅 Assigned Hearing &amp; Consultation Slot</h4>
                            <button
                              className="schedule-slot-btn"
                              onClick={() => openCaseSlotModal(c)}
                            >
                              ✏ {c.hearingDate ? "Edit Hearing Slot & Gitter Link" : "+ Schedule Hearing Slot & Gitter Link"}
                            </button>
                          </div>

                          {c.hearingDate ? (
                            <div className="slot-details-content">
                              <div className="slot-meta-row">
                                <span>📅 <strong>Hearing Date:</strong> {c.hearingDate}</span>
                                <span>⏰ <strong>Time:</strong> {c.hearingTime || "TBD"}</span>
                                <span>⏱ <strong>Duration:</strong> {c.duration || 30} Mins</span>
                                <span>💵 <strong>Fee:</strong> ₹{c.consultationFee || 500}</span>
                              </div>

                              {c.meetingLink && (
                                <div className="meeting-link-row">
                                  <span>💬 <strong>Gitter Room:</strong> <code>{c.meetingLink}</code></span>
                                  <a
                                    href={c.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="gitter-link-btn"
                                  >
                                    🎥 Open Gitter Room ➔
                                  </a>
                                </div>
                              )}

                              {c.advocateNotes && (
                                <p className="slot-notes-text">
                                  <strong>📝 Notes:</strong> {c.advocateNotes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="no-slot-scheduled">
                              No hearing slot scheduled yet for this case. Click <strong>'+ Schedule Hearing Slot &amp; Gitter Link'</strong> to fix a time for the client.
                            </p>
                          )}
                        </div>

                        <div className="case-status-update-bar">
                          <label><strong>Quick Update Case Status:</strong></label>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateCaseStatus(c._id, e.target.value)}
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="Hearing Scheduled">Hearing Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        {/* CASE DOCUMENTS SECTION */}
                        <div className="documents-section">
                          <div className="documents-header">
                            <h4>📄 Attached Case Legal Documents ({c.documents?.length || 0})</h4>
                            <button
                              className="upload-doc-btn"
                              onClick={() => setSelectedCaseForUpload(c)}
                            >
                              + Attach Legal Response File
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
                              No document files attached yet. Click above to attach legal responses.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONSULTATION REQUESTS TAB */}
            {activeTab === "appointments" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <h3 className="section-title">📋 Direct Consultation Requests</h3>
                  <div className="filter-controls">
                    <label>Filter Status:</label>
                    <select
                      className="adv-select"
                      value={statusFilterAppt}
                      onChange={(e) => setStatusFilterAppt(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="adv-empty-state">
                    <h3>No Direct Consultation Requests Found</h3>
                    <p>There are no appointment requests matching your filter.</p>
                  </div>
                ) : (
                  <div className="adv-cards-grid">
                    {filteredAppointments.map((appt) => (
                      <div className="adv-item-card" key={appt._id}>
                        <div className="adv-card-top">
                          <div>
                            <span className="category-tag">
                              {appt.issue ? `Issue: ${appt.issue}` : "Legal Consultation"}
                            </span>
                            <h3 className="client-name">
                              👤 {appt.client?.fullName || appt.client?.name || "Client"}
                            </h3>
                            <p className="client-contact">
                              ✉ {appt.client?.email || "No email"} {appt.client?.phone ? `| 📞 ${appt.client.phone}` : ""}
                            </p>
                          </div>
                          <span
                            className={`status-pill status-${(appt.status || "Pending")
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <p className="adv-item-desc">
                          <strong>Description:</strong> {appt.description || "No description provided."}
                        </p>

                        {/* SLOT DETAILS IF APPROVED */}
                        {appt.status === "Approved" && (
                          <div className="slot-info-box">
                            <p><strong>📅 Date:</strong> {appt.appointmentDate || "TBD"}</p>
                            <p><strong>⏰ Time:</strong> {appt.appointmentTime || "TBD"}</p>
                            <p><strong>⏱ Duration:</strong> {appt.duration || 30} Mins</p>
                            <p><strong>💵 Consultation Fee:</strong> ₹{appt.consultationFee || 0}</p>
                            {appt.meetingLink && (
                              <div className="meeting-link-row">
                                <span>💬 <strong>Gitter Room:</strong></span>
                                <a
                                  href={appt.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="gitter-link-btn"
                                >
                                  🎥 Join Gitter Room ➔
                                </a>
                              </div>
                            )}
                            {appt.advocateNotes && (
                              <p><strong>📝 Notes:</strong> {appt.advocateNotes}</p>
                            )}
                          </div>
                        )}

                        <div className="adv-card-footer">
                          {appt.status === "Pending" && (
                            <div className="action-buttons-group">
                              <button
                                className="action-btn approve-btn"
                                onClick={() => openSlotModal(appt)}
                              >
                                ✓ Approve &amp; Confirm Allotment
                              </button>
                              <button
                                className="action-btn reject-btn"
                                onClick={() => handleRejectAppointment(appt._id)}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}

                          {appt.status === "Approved" && (
                            <div className="action-buttons-group">
                              <button
                                className="action-btn complete-btn"
                                onClick={() => handleCompleteAppointment(appt._id)}
                              >
                                🏆 Mark Consultation Completed
                              </button>
                              <button
                                className="action-btn edit-slot-btn"
                                onClick={() => openSlotModal(appt)}
                              >
                                ✏ Edit Allotment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY ADVOCATE PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <h3 className="section-title">👤 Advocate Profile &amp; Bar Credentials</h3>
                  <button className="action-btn-gold" onClick={openProfileModal}>
                    ✏ Edit Advocate Profile
                  </button>
                </div>

                <div className="profile-display-card">
                  <div className="profile-top-header">
                    <div className="profile-avatar">⚖</div>
                    <div>
                      <h2>{user?.fullName || user?.name}</h2>
                      <p className="profile-spec">{user?.specialization || "General Legal Practice"}</p>
                      <span
                        className={`status-pill status-${(user?.advocateStatus || "Pending Verification")
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        Verification Status: {user?.advocateStatus || "Pending Verification"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-info-grid">
                    <div className="info-item">
                      <strong>Bar Council ID:</strong>
                      <span className="bar-id-pill">📜 {user?.barCouncilId || "Not Provided"}</span>
                    </div>
                    <div className="info-item">
                      <strong>Enrollment Year:</strong>
                      <span>📅 {user?.enrollmentYear || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <strong>Calculated Experience:</strong>
                      <span className="exp-highlight">
                        🎖 {user?.experience !== undefined ? user?.experience : (user?.enrollmentYear ? Math.max(0, new Date().getFullYear() - user.enrollmentYear) : 0)} Years of Practice
                      </span>
                    </div>
                    <div className="info-item">
                      <strong>Email Address:</strong>
                      <span>✉ {user?.email}</span>
                    </div>
                    <div className="info-item">
                      <strong>Phone Number:</strong>
                      <span>📞 {user?.phone || "Not Provided"}</span>
                    </div>
                    <div className="info-item">
                      <strong>Default Consultation Fee:</strong>
                      <span>₹{user?.consultationFee || 0}</span>
                    </div>
                    <div className="info-item full-width">
                      <strong>Office Address / Location:</strong>
                      <span>📍 {user?.officeAddress || "Not Provided"}</span>
                    </div>
                    <div className="info-item full-width">
                      <strong>Professional Biography &amp; Practice Overview:</strong>
                      <p>{user?.bio || "No professional biography added yet. Click 'Edit Advocate Profile' to add your bio."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* CASE HEARING SLOT ALLOCATION MODAL */}
      {selectedCaseForSlot && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Schedule Case Hearing Slot &amp; Gitter Link</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedCaseForSlot(null)}
              >
                ✕
              </button>
            </div>

            <p className="modal-subtitle">
              Case: <strong>{selectedCaseForSlot.title}</strong> | Client: {selectedCaseForSlot.user?.fullName || selectedCaseForSlot.user?.name}
            </p>

            <form onSubmit={handleSaveCaseSlotSubmit} className="modal-form">
              <div className="input-group">
                <label>Hearing / Consultation Date *</label>
                <input
                  type="date"
                  value={caseSlotForm.hearingDate}
                  onChange={(e) =>
                    setCaseSlotForm({ ...caseSlotForm, hearingDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Hearing / Consultation Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={caseSlotForm.hearingTime}
                  onChange={(e) =>
                    setCaseSlotForm({ ...caseSlotForm, hearingTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group-row">
                <div className="input-group">
                  <label>Duration (Mins)</label>
                  <input
                    type="number"
                    value={caseSlotForm.duration}
                    onChange={(e) =>
                      setCaseSlotForm({ ...caseSlotForm, duration: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={caseSlotForm.consultationFee}
                    onChange={(e) =>
                      setCaseSlotForm({ ...caseSlotForm, consultationFee: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Gitter Online Meeting Room Link (Shared with Client)</label>
                <div className="input-with-button-row">
                  <input
                    type="text"
                    placeholder="https://gitter.im/LegalConnect-Case-Room"
                    value={caseSlotForm.meetingLink}
                    onChange={(e) =>
                      setCaseSlotForm({ ...caseSlotForm, meetingLink: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="auto-gen-link-btn"
                    onClick={() => {
                      setCaseSlotForm({
                        ...caseSlotForm,
                        meetingLink: `https://gitter.im/LegalConnect-Case-${selectedCaseForSlot._id}`,
                      });
                    }}
                  >
                    ⚡ Auto-Generate Gitter Link
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Case Status</label>
                <select
                  value={caseSlotForm.status}
                  onChange={(e) =>
                    setCaseSlotForm({ ...caseSlotForm, status: e.target.value })
                  }
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="input-group">
                <label>Advocate Notes &amp; Court/Venue Instructions</label>
                <textarea
                  rows="3"
                  value={caseSlotForm.advocateNotes}
                  onChange={(e) =>
                    setCaseSlotForm({ ...caseSlotForm, advocateNotes: e.target.value })
                  }
                  placeholder="Enter hearing instructions, required documents to bring, or meeting details for client..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedCaseForSlot(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Hearing Slot &amp; Gitter Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENT SLOT ALLOCATION MODAL */}
      {showSlotModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Confirm Consultation Slot Allotment</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowSlotModal(false);
                  setSelectedAppointment(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSlotSubmit} className="modal-form">
              <div className="input-group">
                <label>Appointment Date *</label>
                <input
                  type="date"
                  value={slotForm.appointmentDate}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, appointmentDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Appointment Time *</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={slotForm.appointmentTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, appointmentTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Gitter Online Meeting Room Link</label>
                <div className="input-with-button-row">
                  <input
                    type="text"
                    value={slotForm.meetingLink}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, meetingLink: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="auto-gen-link-btn"
                    onClick={() => {
                      const apptId = selectedAppointment?._id || Date.now();
                      setSlotForm({
                        ...slotForm,
                        meetingLink: `https://gitter.im/LegalConnect-Consultation-${apptId}`,
                      });
                    }}
                  >
                    ⚡ Auto-Generate Gitter Link
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowSlotModal(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Confirm Allotment &amp; Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE FILE UPLOAD MODAL */}
      {selectedCaseForUpload && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Attach Legal Response File to Case</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedCaseForUpload(null)}
              >
                ✕
              </button>
            </div>
            <p className="modal-subtitle">
              Case: <strong>{selectedCaseForUpload.title}</strong>
            </p>

            <form onSubmit={handleUploadCaseDocument} className="modal-form">
              <div className="input-group">
                <label>Select File</label>
                <input
                  type="file"
                  onChange={handleDocumentFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  required
                />
              </div>

              {newDocument.name && (
                <div className="file-summary">
                  <p>
                    <strong>Selected File:</strong> {newDocument.name} ({newDocument.size})
                  </p>
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
                  Upload &amp; Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Advocate Profile</h2>
              <button
                className="modal-close"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>

            {profileMessage && (
              <div
                className={
                  profileMessage.includes("success")
                    ? "adv-success-banner"
                    : "adv-error-banner"
                }
              >
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="modal-form">
              <div className="input-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Legal Specialization</label>
                <select
                  value={profileForm.specialization}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      specialization: e.target.value,
                    })
                  }
                >
                  <option value="Civil Law">Civil Law</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Property & Real Estate">Property & Real Estate</option>
                  <option value="Consumer Protection">Consumer Protection</option>
                  <option value="Cyber Law">Cyber Law</option>
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="General Legal Practice">General Legal Practice</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvocateDashboard;