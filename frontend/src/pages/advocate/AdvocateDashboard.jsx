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
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'appointments' | 'cases' | 'slots' | 'profile'
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilterAppt, setStatusFilterAppt] = useState("All");
  const [statusFilterCase, setStatusFilterCase] = useState("All");

  // Preferred Slots Management State
  const [slotAddForm, setSlotAddForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    duration: 30,
    fee: 500,
  });
  const [autoGenForm, setAutoGenForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    slotDuration: 30,
    fee: 500,
  });
  const [slotMsg, setSlotMsg] = useState("");
  const [slotActionLoading, setSlotActionLoading] = useState(false);

  // Slot Assignment Modal State (for Consultation Request approval)
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    duration: 30,
    consultationFee: "",
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
        fetchAdvocateSlots(advId);
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

  const fetchAdvocateSlots = async (advocateId) => {
    try {
      const res = await api.get(`/users/slots/${advocateId}`);
      if (res.data.success) {
        setSlots(res.data.availableSlots || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Add Single Preferred Slot
  const handleAddSlotSubmit = async (e) => {
    e.preventDefault();
    const advId = user?.id || user?._id;
    if (!advId) return;

    setSlotActionLoading(true);
    setSlotMsg("");

    try {
      const res = await api.post(`/users/slots/${advId}/add`, slotAddForm);
      if (res.data.success) {
        setSlotMsg("Preferred booking slot added successfully!");
        setSlots(res.data.slots || []);
        setTimeout(() => setSlotMsg(""), 3000);
      }
    } catch (err) {
      setSlotMsg(err.response?.data?.message || "Failed to add slot.");
    } finally {
      setSlotActionLoading(false);
    }
  };

  // Auto Generate Daily Slots
  const handleAutoGenSubmit = async (e) => {
    e.preventDefault();
    const advId = user?.id || user?._id;
    if (!advId) return;

    setSlotActionLoading(true);
    setSlotMsg("");

    try {
      const res = await api.post(`/users/slots/${advId}/generate`, autoGenForm);
      if (res.data.success) {
        setSlotMsg(res.data.message || "Daily slots generated successfully!");
        setSlots(res.data.slots || []);
        setTimeout(() => setSlotMsg(""), 3000);
      }
    } catch (err) {
      setSlotMsg(err.response?.data?.message || "Failed to generate slots.");
    } finally {
      setSlotActionLoading(false);
    }
  };

  // Delete Unbooked Slot
  const handleDeleteSlot = async (slotId) => {
    const advId = user?.id || user?._id;
    if (!advId) return;

    if (!window.confirm("Are you sure you want to remove this available booking slot?")) return;

    try {
      const res = await api.delete(`/users/slots/${advId}/${slotId}`);
      if (res.data.success) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove slot.");
    }
  };

  // Open Slot Allocation Modal
  const openSlotModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSlotForm({
      appointmentDate: appointment.appointmentDate || "",
      appointmentTime: appointment.appointmentTime || "",
      duration: appointment.duration || 30,
      consultationFee: appointment.consultationFee || user?.consultationFee || 500,
      advocateNotes: appointment.advocateNotes || "",
    });
    setShowSlotModal(true);
  };

  // Submit Slot Assignment
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
        fetchAdvocateSlots(user.id || user._id);
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

  // Update Case Status
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
  const approvedRequestsCount = appointments.filter((a) => a.status === "Approved").length;
  const completedRequestsCount = appointments.filter((a) => a.status === "Completed").length;
  const openSlotsCount = slots.filter((s) => !s.isBooked).length;
  const bookedSlotsCount = slots.filter((s) => s.isBooked).length;

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
          <h1>Advocate Consultation &amp; Preferred Slot Booking Portal</h1>
          <p>
            Set your preferred booking slots, define working hours, review client consultation requests, access case documents, and update hearing progress in real-time.
          </p>

          <div className="adv-stats-row">
            <div className="adv-stat-box">
              <span className="adv-stat-val">{openSlotsCount}</span>
              <span className="adv-stat-lbl">Open Preferred Slots</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">{bookedSlotsCount}</span>
              <span className="adv-stat-lbl">Booked Client Slots</span>
            </div>
            <div className="adv-stat-box warning-box">
              <span className="adv-stat-val">{pendingRequestsCount}</span>
              <span className="adv-stat-lbl">Pending Requests</span>
            </div>
            <div className="adv-stat-box">
              <span className="adv-stat-val">{cases.length}</span>
              <span className="adv-stat-lbl">Assigned Cases</span>
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
            className={`adv-tab-btn ${activeTab === "slots" ? "active" : ""}`}
            onClick={() => setActiveTab("slots")}
          >
            📅 Preferred Slots &amp; Availability ({openSlotsCount} Open)
          </button>

          <button
            className={`adv-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            📋 Consultation Requests ({appointments.length})
          </button>

          <button
            className={`adv-tab-btn ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => setActiveTab("cases")}
          >
            📂 Assigned Cases &amp; Documents ({cases.length})
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
                      <span className="card-emoji">📅</span>
                      <h4>Preferred Booking Slots</h4>
                    </div>
                    <p className="card-big-number">{openSlotsCount} Open</p>
                    <p className="card-subtext">
                      {bookedSlotsCount} slots already booked by clients. Set your preferred consultation times.
                    </p>
                    <button
                      className="adv-card-action-btn gold-btn"
                      onClick={() => setActiveTab("slots")}
                    >
                      + Manage Preferred Slots &amp; Hours →
                    </button>
                  </div>

                  <div className="adv-overview-card">
                    <div className="card-icon-header">
                      <span className="card-emoji">📋</span>
                      <h4>Consultation Queue</h4>
                    </div>
                    <p className="card-big-number">{pendingRequestsCount}</p>
                    <p className="card-subtext">
                      Client appointment requests waiting for slot allotment
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
                      <span className="card-emoji">📂</span>
                      <h4>Active Legal Cases</h4>
                    </div>
                    <p className="card-big-number">{cases.length}</p>
                    <p className="card-subtext">
                      Registered complaints &amp; files assigned by clients
                    </p>
                    <button
                      className="adv-card-action-btn"
                      onClick={() => setActiveTab("cases")}
                    >
                      Manage Assigned Cases →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERRED SLOTS MANAGEMENT TAB */}
            {activeTab === "slots" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <div>
                    <h3 className="section-title">📅 Manage Preferred Available Booking Slots</h3>
                    <p className="section-subtitle">
                      Set your preferred consultation dates, start times, and end times. Clients can view and reserve these published slots directly.
                    </p>
                  </div>
                </div>

                {slotMsg && (
                  <div className={slotMsg.includes("Failed") || slotMsg.includes("Error") ? "adv-error-banner" : "adv-success-banner"}>
                    {slotMsg}
                  </div>
                )}

                <div className="slots-creation-row">
                  {/* FORM 1: ADD SINGLE PREFERRED SLOT */}
                  <div className="slot-form-card">
                    <h4>➕ Add Custom Booking Slot</h4>
                    <form onSubmit={handleAddSlotSubmit} className="slot-mini-form">
                      <div className="input-group">
                        <label>Slot Date *</label>
                        <input
                          type="date"
                          value={slotAddForm.date}
                          onChange={(e) => setSlotAddForm({ ...slotAddForm, date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Start Time *</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:00 AM"
                            value={slotAddForm.startTime}
                            onChange={(e) => setSlotAddForm({ ...slotAddForm, startTime: e.target.value })}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>End Time *</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:30 AM"
                            value={slotAddForm.endTime}
                            onChange={(e) => setSlotAddForm({ ...slotAddForm, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Duration (Mins)</label>
                          <input
                            type="number"
                            value={slotAddForm.duration}
                            onChange={(e) => setSlotAddForm({ ...slotAddForm, duration: e.target.value })}
                          />
                        </div>
                        <div className="input-group">
                          <label>Fee (₹)</label>
                          <input
                            type="number"
                            value={slotAddForm.fee}
                            onChange={(e) => setSlotAddForm({ ...slotAddForm, fee: e.target.value })}
                          />
                        </div>
                      </div>

                      <button type="submit" className="submit-btn" disabled={slotActionLoading}>
                        {slotActionLoading ? "Adding..." : "+ Publish Booking Slot"}
                      </button>
                    </form>
                  </div>

                  {/* FORM 2: AUTO-GENERATE DAILY SLOTS */}
                  <div className="slot-form-card auto-gen-card">
                    <h4>⚡ Auto-Generate Daily Slots</h4>
                    <p className="form-sub-desc">Automatically create consecutive consultation slots for a full day based on your working schedule.</p>

                    <form onSubmit={handleAutoGenSubmit} className="slot-mini-form">
                      <div className="input-group">
                        <label>Target Date *</label>
                        <input
                          type="date"
                          value={autoGenForm.date}
                          onChange={(e) => setAutoGenForm({ ...autoGenForm, date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Day Start Time</label>
                          <input
                            type="text"
                            value={autoGenForm.startTime}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, startTime: e.target.value })}
                          />
                        </div>
                        <div className="input-group">
                          <label>Day End Time</label>
                          <input
                            type="text"
                            value={autoGenForm.endTime}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, endTime: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Slot Size (Mins)</label>
                          <select
                            value={autoGenForm.slotDuration}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, slotDuration: e.target.value })}
                          >
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Consultation Fee (₹)</label>
                          <input
                            type="number"
                            value={autoGenForm.fee}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, fee: e.target.value })}
                          />
                        </div>
                      </div>

                      <button type="submit" className="submit-btn gold-btn" disabled={slotActionLoading}>
                        {slotActionLoading ? "Generating..." : "⚡ Generate Day Slots"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* DISPLAY PUBLISHED SLOTS */}
                <div className="published-slots-container">
                  <h4 className="sub-title">📋 Published Booking Slots ({slots.length})</h4>

                  {slots.length === 0 ? (
                    <div className="adv-empty-state">
                      <h3>No Preferred Slots Published Yet</h3>
                      <p>Use the forms above to set your preferred booking times for clients.</p>
                    </div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((s) => (
                        <div className={`slot-chip-card ${s.isBooked ? "booked-slot" : "available-slot"}`} key={s.slotId}>
                          <div className="slot-chip-header">
                            <span className="slot-date">📅 {s.date}</span>
                            <span className={`slot-status-pill ${s.isBooked ? "status-booked" : "status-open"}`}>
                              {s.isBooked ? "Booked" : "Open for Booking"}
                            </span>
                          </div>

                          <div className="slot-time">
                            ⏰ {s.startTime} - {s.endTime} ({s.duration} Mins)
                          </div>

                          <div className="slot-fee">
                            <strong>Fee:</strong> ₹{s.fee}
                          </div>

                          {!s.isBooked ? (
                            <button
                              className="delete-slot-btn"
                              onClick={() => handleDeleteSlot(s.slotId)}
                              title="Delete Slot"
                            >
                              🗑 Remove Slot
                            </button>
                          ) : (
                            <p className="booked-by-tag">
                              👤 Reserved by Client
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONSULTATION REQUESTS TAB */}
            {activeTab === "appointments" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <h3 className="section-title">📋 Client Consultation Requests &amp; Slot Allotments</h3>
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
                    <h3>No Consultation Requests Found</h3>
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

                        {/* PREFERRED REQUESTED TIME IF AVAILABLE */}
                        {appt.appointmentDate && (
                          <div className="preferred-time-badge">
                            📅 <strong>Requested Slot:</strong> {appt.appointmentDate} @ {appt.appointmentTime || "TBD"} (₹{appt.consultationFee || 500})
                          </div>
                        )}

                        {/* SLOT DETAILS IF APPROVED */}
                        {appt.status === "Approved" && (
                          <div className="slot-info-box">
                            <p><strong>📅 Date:</strong> {appt.appointmentDate || "TBD"}</p>
                            <p><strong>⏰ Time:</strong> {appt.appointmentTime || "TBD"}</p>
                            <p><strong>⏱ Duration:</strong> {appt.duration || 30} Mins</p>
                            <p><strong>💵 Consultation Fee:</strong> ₹{appt.consultationFee || 0}</p>
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

                          {(appt.status === "Completed" || appt.status === "Rejected") && (
                            <p className="status-note">
                              This request has been finalized as <strong>{appt.status}</strong>.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ASSIGNED CASES & DOCUMENTS TAB */}
            {activeTab === "cases" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <h3 className="section-title">📂 Assigned Client Cases &amp; Document Files</h3>
                  <div className="filter-controls">
                    <label>Filter Case Status:</label>
                    <select
                      className="adv-select"
                      value={statusFilterCase}
                      onChange={(e) => setStatusFilterCase(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Hearing Scheduled">Hearing Scheduled</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {filteredCases.length === 0 ? (
                  <div className="adv-empty-state">
                    <h3>No Cases Assigned Yet</h3>
                    <p>When clients select you as their advocate, their cases will appear here.</p>
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

                        <div className="case-status-update-bar">
                          <label><strong>Update Status:</strong></label>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateCaseStatus(c._id, e.target.value)}
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Hearing Scheduled">Hearing Scheduled</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        {/* CASE DOCUMENTS SECTION */}
                        <div className="documents-section">
                          <div className="documents-header">
                            <h4>📄 Attached Legal Documents ({c.documents?.length || 0})</h4>
                            <button
                              className="upload-doc-btn"
                              onClick={() => setSelectedCaseForUpload(c)}
                            >
                              + Attach Advocate Response File
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

      {/* SLOT ALLOCATION MODAL */}
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

            <p className="modal-subtitle">
              Client: <strong>{selectedAppointment?.client?.fullName || selectedAppointment?.client?.name}</strong> | Issue: {selectedAppointment?.issue}
            </p>

            {/* IF ADVOCATE HAS PUBLISHED PREFERRED SLOTS, SHOW QUICK SELECTOR */}
            {slots.filter((s) => !s.isBooked).length > 0 && (
              <div className="quick-slot-picker">
                <label><strong>Quick Select from Your Published Preferred Slots:</strong></label>
                <div className="quick-slot-chips">
                  {slots
                    .filter((s) => !s.isBooked)
                    .map((s) => (
                      <button
                        type="button"
                        key={s.slotId}
                        className="quick-slot-btn"
                        onClick={() => {
                          setSlotForm({
                            ...slotForm,
                            appointmentDate: s.date,
                            appointmentTime: s.startTime,
                            duration: s.duration,
                            consultationFee: s.fee,
                          });
                        }}
                      >
                        📅 {s.date} @ {s.startTime} (₹{s.fee})
                      </button>
                    ))}
                </div>
              </div>
            )}

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
                <label>Consultation Duration (Minutes)</label>
                <input
                  type="number"
                  value={slotForm.duration}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, duration: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={slotForm.consultationFee}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, consultationFee: e.target.value })
                  }
                  placeholder="e.g. 500"
                />
              </div>

              <div className="input-group">
                <label>Advocate Instructions / Meeting Venue / Video Link</label>
                <textarea
                  rows="3"
                  value={slotForm.advocateNotes}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, advocateNotes: e.target.value })
                  }
                  placeholder="Instructions for client regarding video meeting link, chamber location, or required documents..."
                />
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
                <label>Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
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

              <div className="input-group">
                <label>Default Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={profileForm.consultationFee}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      consultationFee: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Office Address / Chamber Location</label>
                <input
                  type="text"
                  value={profileForm.officeAddress}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      officeAddress: e.target.value,
                    })
                  }
                  placeholder="e.g. High Court Complex, Chamber 402"
                />
              </div>

              <div className="input-group">
                <label>Professional Bio &amp; Overview</label>
                <textarea
                  rows="4"
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  placeholder="Describe your legal background, key victories, court experience..."
                />
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