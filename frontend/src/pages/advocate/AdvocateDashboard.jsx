import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  getAdvocateAppointments,
  assignSlot,
  rejectAppointment,
  completeAppointment,
} from "../../services/appointmentService";
import {
  getAdvocateSlots,
  addAdvocateSlot,
  autoGenerateSlots,
  deleteAdvocateSlot,
} from "../../services/userService";
import "./AdvocateDashboard.css";

function AdvocateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'slots' | 'cases' | 'appointments' | 'profile'
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilterAppt, setStatusFilterAppt] = useState("All");
  const [statusFilterCase, setStatusFilterCase] = useState("All");

  // Slot Management Forms State
  const [singleSlotForm, setSingleSlotForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    duration: 30,
    fee: "",
  });
  const [autoGenForm, setAutoGenForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    slotDuration: 30,
    fee: "",
  });
  const [slotActionMessage, setSlotActionMessage] = useState("");

  // Case Hearing Slot Allocation Modal State (Slot assigned directly under each case)
  const [selectedCaseForSlot, setSelectedCaseForSlot] = useState(null);
  const [caseSlotForm, setCaseSlotForm] = useState({
    hearingDate: "",
    hearingTime: "",
    duration: 30,
    consultationFee: "",
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

      // Fetch Advocate Available Slots
      try {
        const slotRes = await getAdvocateSlots(advocateId);
        if (slotRes?.data?.success) {
          setAvailableSlots(slotRes.data.availableSlots || []);
        }
      } catch (errSlot) {
        console.error("Error fetching advocate slots:", errSlot);
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

  // Add Single Custom Slot
  const handleAddSingleSlot = async (e) => {
    e.preventDefault();
    const advId = user.id || user._id;
    if (!advId) return;

    try {
      const payload = {
        ...singleSlotForm,
        fee: singleSlotForm.fee !== "" ? Number(singleSlotForm.fee) : (user?.consultationFee ?? null),
      };
      const res = await addAdvocateSlot(advId, payload);
      if (res.data.success) {
        setAvailableSlots(res.data.slots || []);
        setSlotActionMessage("Single consultation slot added successfully!");
        setTimeout(() => setSlotActionMessage(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add consultation slot.");
    }
  };

  // Auto Generate Daily Slots
  const handleAutoGenerateSlots = async (e) => {
    e.preventDefault();
    const advId = user.id || user._id;
    if (!advId) return;

    try {
      const payload = {
        ...autoGenForm,
        fee: autoGenForm.fee !== "" ? Number(autoGenForm.fee) : (user?.consultationFee ?? null),
      };
      const res = await autoGenerateSlots(advId, payload);
      if (res.data.success) {
        setAvailableSlots(res.data.slots || []);
        setSlotActionMessage(res.data.message || "Daily slots generated successfully!");
        setTimeout(() => setSlotActionMessage(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to auto-generate slots.");
    }
  };

  // Delete Unbooked Slot
  const handleDeleteSlot = async (slotId) => {
    const advId = user.id || user._id;
    if (!advId || !slotId) return;
    if (!window.confirm("Are you sure you want to delete this unbooked slot?")) return;

    try {
      const res = await deleteAdvocateSlot(advId, slotId);
      if (res.data.success) {
        setAvailableSlots(res.data.slots || []);
        setSlotActionMessage("Slot removed successfully.");
        setTimeout(() => setSlotActionMessage(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete slot.");
    }
  };

  // Open Case Hearing Slot Scheduling Modal
  const openCaseSlotModal = (c) => {
    setSelectedCaseForSlot(c);
    const defaultMeetingLink = `https://meet.jit.si/LegalConnect-Case-${c._id}`;
    setCaseSlotForm({
      hearingDate: c.hearingDate || new Date().toISOString().split("T")[0],
      hearingTime: c.hearingTime || "10:00 AM",
      duration: c.duration || 30,
      consultationFee: c.consultationFee !== undefined && c.consultationFee !== null ? c.consultationFee : (user?.consultationFee || ""),
      meetingLink: c.meetingLink || defaultMeetingLink,
      advocateNotes: c.advocateNotes || "",
      status: c.status === "Pending" || c.status === "Assigned" ? "Hearing Scheduled" : c.status,
    });
  };

  // Save Case Hearing Slot & Online Meeting Link
  const handleSaveCaseSlotSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseForSlot) return;

    try {
      const payload = {
        ...caseSlotForm,
        consultationFee: caseSlotForm.consultationFee !== "" ? Number(caseSlotForm.consultationFee) : null,
      };
      const res = await api.put(`/complaints/${selectedCaseForSlot._id}`, payload);
      if (res.data.success) {
        alert("Case Hearing Slot & Online Meeting Link Scheduled Successfully!");
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
      consultationFee: appointment.consultationFee !== undefined && appointment.consultationFee !== null ? appointment.consultationFee : (user?.consultationFee || ""),
      meetingLink: appointment.meetingLink || `https://meet.jit.si/LegalConnect-Consultation-${appointment._id}`,
      advocateNotes: appointment.advocateNotes || "",
    });
    setShowSlotModal(true);
  };

  // Submit Appointment Slot Assignment
  const handleAssignSlotSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const payload = {
        ...slotForm,
        consultationFee: slotForm.consultationFee !== "" ? Number(slotForm.consultationFee) : null,
      };
      const res = await assignSlot(selectedAppointment._id, payload);
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
      consultationFee: user?.consultationFee !== undefined && user?.consultationFee !== null ? user.consultationFee : "",
    });
    setProfileMessage("");
    setShowProfileModal(true);
  };

  // Submit Profile Edit Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileForm,
        consultationFee: profileForm.consultationFee !== "" ? Number(profileForm.consultationFee) : null,
      };
      const res = await api.put(`/users/profile/${user.id || user._id}`, payload);
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
  const openSlotsCount = availableSlots.filter((s) => !s.isBooked).length;

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
          <h1>Advocate Availability &amp; Consultation Management Portal</h1>
          <p>
            Set your consultation fee per hour, configure your available dates and times, confirm consultation slots, and share conference-call links with clients.
          </p>

          <div className="adv-stats-row">
            <div className="adv-stat-box">
              <span className="adv-stat-val">{availableSlots.length}</span>
              <span className="adv-stat-lbl">Configured Slots ({openSlotsCount} Available)</span>
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
                {user?.consultationFee ? `₹${user.consultationFee}/hr` : "Fee Not Set"}
              </span>
              <span className="adv-stat-lbl">Consultation Fee</span>
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
            🗓 Availability &amp; Slots ({availableSlots.length})
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
                      <span className="card-emoji">🗓</span>
                      <h4>Available Consultation Slots</h4>
                    </div>
                    <p className="card-big-number">{openSlotsCount} Available</p>
                    <p className="card-subtext">
                      {availableSlots.length} total slots created across various dates.
                    </p>
                    <button
                      className="adv-card-action-btn gold-btn"
                      onClick={() => setActiveTab("slots")}
                    >
                      Manage Available Slots →
                    </button>
                  </div>

                  <div className="adv-overview-card">
                    <div className="card-icon-header">
                      <span className="card-emoji">📋</span>
                      <h4>Consultation Requests Queue</h4>
                    </div>
                    <p className="card-big-number">{pendingRequestsCount}</p>
                    <p className="card-subtext">
                      Direct client appointment requests waiting for confirmation &amp; meeting links.
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
                      <h4>Hourly Consultation Fee</h4>
                    </div>
                    <p className="card-big-number">
                      {user?.consultationFee ? `₹${user.consultationFee}/hr` : "Not Set"}
                    </p>
                    <p className="card-subtext">
                      {user?.specialization || "General Practice"}
                    </p>
                    <button
                      className="adv-card-action-btn"
                      onClick={() => setActiveTab("profile")}
                    >
                      Set Fee &amp; Edit Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AVAILABILITY & CONSULTATION SLOTS MANAGEMENT */}
            {activeTab === "slots" && (
              <div className="adv-section">
                <div className="section-header-row">
                  <div>
                    <h3 className="section-title">🗓 Availability &amp; Consultation Slot Management</h3>
                    <p className="section-subtitle">
                      Set your available dates and times for client consultations. Clients can view these available slots before booking.
                    </p>
                  </div>
                </div>

                {slotActionMessage && (
                  <div className="adv-success-banner">
                    {slotActionMessage}
                  </div>
                )}

                <div className="adv-slot-management-grid">
                  {/* FORM 1: ADD SINGLE SLOT */}
                  <div className="slot-form-card">
                    <h4>+ Add Single Consultation Slot</h4>
                    <p className="form-subtext">Add a specific date and time window when you are free.</p>

                    <form onSubmit={handleAddSingleSlot} className="slot-inner-form">
                      <div className="input-group">
                        <label>Date *</label>
                        <input
                          type="date"
                          value={singleSlotForm.date}
                          onChange={(e) => setSingleSlotForm({ ...singleSlotForm, date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Start Time *</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:00 AM"
                            value={singleSlotForm.startTime}
                            onChange={(e) => setSingleSlotForm({ ...singleSlotForm, startTime: e.target.value })}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>End Time *</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:30 AM"
                            value={singleSlotForm.endTime}
                            onChange={(e) => setSingleSlotForm({ ...singleSlotForm, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Duration (Mins)</label>
                          <input
                            type="number"
                            value={singleSlotForm.duration}
                            onChange={(e) => setSingleSlotForm({ ...singleSlotForm, duration: e.target.value })}
                          />
                        </div>

                        <div className="input-group">
                          <label>Slot Fee (₹)</label>
                          <input
                            type="number"
                            placeholder={user?.consultationFee ? `Default: ₹${user.consultationFee}` : "Set fee for this slot"}
                            value={singleSlotForm.fee}
                            onChange={(e) => setSingleSlotForm({ ...singleSlotForm, fee: e.target.value })}
                          />
                        </div>
                      </div>

                      <button type="submit" className="add-slot-submit-btn">
                        + Add Custom Slot
                      </button>
                    </form>
                  </div>

                  {/* FORM 2: AUTO GENERATE DAILY SLOTS */}
                  <div className="slot-form-card">
                    <h4>⚡ Auto-Generate Daily Slots</h4>
                    <p className="form-subtext">Generate back-to-back consultation slots for an entire working day.</p>

                    <form onSubmit={handleAutoGenerateSlots} className="slot-inner-form">
                      <div className="input-group">
                        <label>Select Date *</label>
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
                            placeholder="e.g. 09:00 AM"
                            value={autoGenForm.startTime}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, startTime: e.target.value })}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>Day End Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 05:00 PM"
                            value={autoGenForm.endTime}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, endTime: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group-row">
                        <div className="input-group">
                          <label>Slot Duration (Mins)</label>
                          <input
                            type="number"
                            value={autoGenForm.slotDuration}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, slotDuration: e.target.value })}
                          />
                        </div>

                        <div className="input-group">
                          <label>Fee per Slot (₹)</label>
                          <input
                            type="number"
                            placeholder={user?.consultationFee ? `Default: ₹${user.consultationFee}` : "Set fee per slot"}
                            value={autoGenForm.fee}
                            onChange={(e) => setAutoGenForm({ ...autoGenForm, fee: e.target.value })}
                          />
                        </div>
                      </div>

                      <button type="submit" className="add-slot-submit-btn gold-btn">
                        ⚡ Generate Full Day Slots
                      </button>
                    </form>
                  </div>
                </div>

                {/* CONFIGURED SLOTS DISPLAY */}
                <div className="configured-slots-section">
                  <h4 className="sub-title">📋 Your Configured Available Slots ({availableSlots.length})</h4>

                  {availableSlots.length === 0 ? (
                    <div className="adv-empty-state">
                      <h3>No Available Slots Configured Yet</h3>
                      <p>Use the forms above to set your available dates and times for client bookings.</p>
                    </div>
                  ) : (
                    <div className="slots-grid-display">
                      {availableSlots.map((slot) => (
                        <div
                          className={`slot-card-item ${slot.isBooked ? "booked-slot" : "available-slot"}`}
                          key={slot.slotId || slot._id}
                        >
                          <div className="slot-card-top">
                            <span className="slot-date-badge">📅 {slot.date}</span>
                            <span className={`slot-status-pill ${slot.isBooked ? "booked" : "free"}`}>
                              {slot.isBooked ? "🔒 Booked" : "✓ Available"}
                            </span>
                          </div>

                          <div className="slot-card-body">
                            <p className="slot-time-text">
                              ⏰ <strong>{slot.startTime}</strong> - <strong>{slot.endTime}</strong>
                            </p>
                            <p className="slot-meta-text">
                              ⏱ Duration: {slot.duration || 30} Mins | 💵 Fee: {slot.fee ? `₹${slot.fee}` : "Not Specified"}
                            </p>
                          </div>

                          {!slot.isBooked ? (
                            <button
                              className="delete-slot-btn"
                              onClick={() => handleDeleteSlot(slot.slotId)}
                            >
                              🗑 Delete Slot
                            </button>
                          ) : (
                            <p className="booked-by-subtext">Booked by client</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                      Assign hearing dates, times, advocate notes, and online meeting links directly under each client case.
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
                              ✏ {c.hearingDate ? "Edit Hearing Slot & Meeting Link" : "+ Schedule Hearing Slot & Meeting Link"}
                            </button>
                          </div>

                          {c.hearingDate ? (
                            <div className="slot-details-content">
                              <div className="slot-meta-row">
                                <span>📅 <strong>Hearing Date:</strong> {c.hearingDate}</span>
                                <span>⏰ <strong>Time:</strong> {c.hearingTime || "TBD"}</span>
                                <span>⏱ <strong>Duration:</strong> {c.duration || 30} Mins</span>
                                <span>💵 <strong>Fee:</strong> {c.consultationFee ? `₹${c.consultationFee}` : "Not Specified"}</span>
                              </div>

                              

                              {c.advocateNotes && (
                                <p className="slot-notes-text">
                                  <strong>📝 Notes:</strong> {c.advocateNotes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="no-slot-scheduled">
                              No hearing slot scheduled yet for this case. Click <strong>'+ Schedule Hearing Slot &amp; Meeting Link'</strong> to fix a time for the client.
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
                            <p><strong>💵 Consultation Fee:</strong> {appt.consultationFee ? `₹${appt.consultationFee}` : "Not Specified"}</p>
                            {appt.meetingLink && (
                              <div className="meeting-link-row">
                                <span>💬 <strong>Conference Link:</strong></span>
                                <a
                                  href={appt.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="call-link-btn"
                                >
                                  🎥 Join Conference Call ➔
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
                      <strong>Hourly Consultation Fee:</strong>
                      <span>{user?.consultationFee ? `₹${user.consultationFee} / hour` : "Not Specified"}</span>
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
              <h2>Schedule Case Hearing Slot &amp; Online Call Link</h2>
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
                    placeholder="Enter fee or leave empty"
                    value={caseSlotForm.consultationFee}
                    onChange={(e) =>
                      setCaseSlotForm({ ...caseSlotForm, consultationFee: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Shareable Conference-Call Link (Shared with Client)</label>
                <div className="input-with-button-row">
                  <input
                    type="text"
                    placeholder="e.g. https://meet.google.com/abc-defg-hij or https://zoom.us/j/123"
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
                        meetingLink: `https://meet.jit.si/LegalConnect-Case-${selectedCaseForSlot._id}`,
                      });
                    }}
                  >
                    ⚡ Auto-Generate Link
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
                  Save Hearing Slot &amp; Meeting Link
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
              <h2>Confirm Consultation Slot &amp; Share Call Link</h2>
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

              <div className="input-group-row">
                <div className="input-group">
                  <label>Duration (Mins)</label>
                  <input
                    type="number"
                    value={slotForm.duration}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, duration: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter fee or leave empty"
                    value={slotForm.consultationFee}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, consultationFee: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Shareable Online Conference Call Link (Google Meet, Zoom, Jitsi, etc.)</label>
                <div className="input-with-button-row">
                  <input
                    type="text"
                    placeholder="https://meet.google.com/abc-defg-hij"
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
                        meetingLink: `https://meet.jit.si/LegalConnect-Consultation-${apptId}`,
                      });
                    }}
                  >
                    ⚡ Auto-Generate Call Link
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Advocate Notes for Client</label>
                <textarea
                  rows="3"
                  value={slotForm.advocateNotes}
                  onChange={(e) => setSlotForm({ ...slotForm, advocateNotes: e.target.value })}
                  placeholder="Enter meeting instructions, preparation notes, or call reminders..."
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
                  Confirm Slot &amp; Approve
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
                <label>Consultation Fee (₹ per hour)</label>
                <input
                  type="number"
                  placeholder="Set your hourly consultation fee (e.g. 1500)"
                  value={profileForm.consultationFee}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, consultationFee: e.target.value })
                  }
                />
                <span className="input-help-text">Leave empty if fee is not specified. No default fee will be displayed.</span>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                <label>Office Address</label>
                <input
                  type="text"
                  value={profileForm.officeAddress}
                  onChange={(e) => setProfileForm({ ...profileForm, officeAddress: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Professional Bio</label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
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
                  Save Profile Changes
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