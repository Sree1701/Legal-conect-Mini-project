import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'advocates' | 'verify' | 'logs'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalAdvocates: 0,
    pendingAdvocates: 0,
    totalCases: 0,
    totalLogins: 0,
  });
  const [users, setUsers] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/admin");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") {
        navigate("/admin", {
          state: { error: "Access Denied: Admin privileges required to access Admin Dashboard." }
        });
        return;
      }

      setAdminUser(parsedUser);
      fetchAllAdminData();
    } catch (e) {
      navigate("/admin");
    }
  }, [navigate]);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsRes = await api.get("/admin/stats");
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch client users
      const usersRes = await api.get("/admin/users");
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      // Fetch advocates
      const advRes = await api.get("/admin/advocates");
      if (advRes.data.success) {
        setAdvocates(advRes.data.data);
      }

      // Fetch login audit logs
      const logsRes = await api.get("/admin/logs");
      if (logsRes.data.success) {
        setLoginLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching admin panel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  };

  const handleUpdateStatus = async (advocateId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to '${newStatus}'?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/advocates/${advocateId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchAllAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update advocate status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently remove user '${userName}'?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAllAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove user.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Advocates safely
  const filteredAdvocates = (advocates || []).filter((adv) => {
    const searchLower = (searchTerm || "").toLowerCase();
    const nameStr = (adv?.fullName || adv?.name || "").toLowerCase();
    const emailStr = (adv?.email || "").toLowerCase();
    const barIdStr = (adv?.barCouncilId || "").toLowerCase();

    const matchesSearch =
      nameStr.includes(searchLower) ||
      emailStr.includes(searchLower) ||
      barIdStr.includes(searchLower);

    const matchesStatus =
      statusFilter === "All" || adv?.advocateStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter Clients safely
  const filteredUsers = (users || []).filter((u) => {
    const searchLower = (searchTerm || "").toLowerCase();
    const nameStr = (u?.fullName || u?.name || "").toLowerCase();
    const emailStr = (u?.email || "").toLowerCase();

    return nameStr.includes(searchLower) || emailStr.includes(searchLower);
  });

  const pendingAdvocatesList = (advocates || []).filter(
    (adv) => adv?.advocateStatus === "Pending Verification"
  );

  return (
    <div className="admin-dashboard-wrapper">
      {/* ADMIN DASHBOARD HEADER NAVBAR */}
      <header className="admin-header">
        <div className="admin-brand">
          <img src="/logo.png" alt="LegalConnect Logo" className="admin-dashboard-logo-image" />
          <div>
            <h2>LegalConnect Admin Panel</h2>
            <p>System Administration &amp; Verification Control</p>
          </div>
        </div>

        <div className="admin-user-controls">
          <div className="admin-badge-pill">
            <span>Admin: <strong>{adminUser?.fullName || adminUser?.name || "Administrator"}</strong></span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout ➔
          </button>
        </div>
      </header>

      {/* ADMIN HERO BANNER */}
      <section className="admin-hero-banner">
        <div className="admin-hero-content">
          <h1>Welcome to System Control Dashboard</h1>
          <p>
            Manage clients, inspect Bar Council registrations, verify advocate genuineness, approve pending counselors, and view real-time login security logs.
          </p>

          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <span className="stat-val">{stats.totalUsers}</span>
              <span className="stat-lbl">Total Registered Users</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-val">{stats.totalClients}</span>
              <span className="stat-lbl">Total Clients</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-val">{stats.totalAdvocates}</span>
              <span className="stat-lbl">Total Advocates</span>
            </div>
            <div className="admin-stat-card warning-stat">
              <span className="stat-val">{stats.pendingAdvocates}</span>
              <span className="stat-lbl">Pending Verification</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-val">{stats.totalLogins}</span>
              <span className="stat-lbl">Login History Records</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN ADMIN CONTENT */}
      <main className="admin-main-container">
        {/* TABS NAVIGATION */}
        <div className="admin-tabs-nav">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 System Overview
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Manage Users ({users.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "advocates" ? "active" : ""}`}
            onClick={() => setActiveTab("advocates")}
          >
            ⚖ Manage Advocates ({advocates.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "verify" ? "active" : ""}`}
            onClick={() => setActiveTab("verify")}
          >
            📜 Verify Bar Council IDs ({pendingAdvocatesList.length} Pending)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            🔒 View Login Information ({loginLogs.length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-spinner">Loading Admin Panel Data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="admin-section">
                <h3 className="section-title">📊 Portal Status & Metrics</h3>

                <div className="overview-cards-grid">
                  <div className="overview-card">
                    <div className="overview-card-header">
                      <span className="card-icon">👥</span>
                      <h4>User Growth</h4>
                    </div>
                    <p className="card-big-num">{stats.totalUsers}</p>
                    <p className="card-subtext">
                      {stats.totalClients} Clients | {stats.totalAdvocates} Advocates
                    </p>
                    <button className="card-action-btn" onClick={() => setActiveTab("users")}>
                      View All Users →
                    </button>
                  </div>

                  <div className="overview-card alert-card">
                    <div className="overview-card-header">
                      <span className="card-icon">⚖</span>
                      <h4>Pending Verification</h4>
                    </div>
                    <p className="card-big-num">{stats.pendingAdvocates}</p>
                    <p className="card-subtext">
                      Advocates awaiting Bar Council ID genuineness verification
                    </p>
                    <button className="card-action-btn alert-btn" onClick={() => setActiveTab("verify")}>
                      Review Verification Queue →
                    </button>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-header">
                      <span className="card-icon">💼</span>
                      <h4>Case Consultations</h4>
                    </div>
                    <p className="card-big-num">{stats.totalCases}</p>
                    <p className="card-subtext">Registered Legal Complaints & Files</p>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-header">
                      <span className="card-icon">🔒</span>
                      <h4>Security Audits</h4>
                    </div>
                    <p className="card-big-num">{stats.totalLogins}</p>
                    <p className="card-subtext">Login attempts tracked with OTP authentication</p>
                    <button className="card-action-btn" onClick={() => setActiveTab("logs")}>
                      View Audit Logs →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE USERS TAB */}
            {activeTab === "users" && (
              <div className="admin-section">
                <div className="section-header-row">
                  <h3 className="section-title">👥 Manage Client Accounts</h3>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search clients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="admin-empty-box">No client accounts found.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Client Name</th>
                          <th>Email Address</th>
                          <th>Phone</th>
                          <th>Joined Date</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <strong>👤 {u.fullName}</strong>
                            </td>
                            <td>✉ {u.email}</td>
                            <td>📞 {u.phone || "N/A"}</td>
                            <td>📅 {new Date(u.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className="role-pill client-pill">Client</span>
                            </td>
                            <td>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteUser(u._id, u.fullName)}
                                disabled={actionLoading}
                              >
                                🗑 Remove Account
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MANAGE ADVOCATES TAB */}
            {activeTab === "advocates" && (
              <div className="admin-section">
                <div className="section-header-row">
                  <h3 className="section-title">⚖ Manage Advocate Accounts</h3>
                  <div className="filter-controls">
                    <select
                      className="admin-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search advocates or Bar ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredAdvocates.length === 0 ? (
                  <div className="admin-empty-box">No advocate accounts found.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Advocate Name</th>
                          <th>Bar Council ID</th>
                          <th>Enrollment Year</th>
                          <th>Years of Experience</th>
                          <th>Verification Status</th>
                          <th>Change Status / Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdvocates.map((adv) => (
                          <tr key={adv._id}>
                            <td>
                              <strong>👨‍⚖ {adv.fullName}</strong>
                              <div className="table-subtext">✉ {adv.email} {adv.phone ? `| 📞 ${adv.phone}` : ""}</div>
                            </td>
                            <td>
                              <span className="bar-id-pill">📜 {adv.barCouncilId || "Not Provided"}</span>
                            </td>
                            <td>📅 {adv.enrollmentYear || "N/A"}</td>
                            <td>
                              <strong className="exp-highlight">
                                🎖 {adv.experience} Years
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`status-pill status-${(adv.advocateStatus || "Pending Verification")
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {adv.advocateStatus || "Pending Verification"}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                {adv.advocateStatus !== "Approved" && (
                                  <button
                                    className="action-btn approve-btn"
                                    onClick={() => handleUpdateStatus(adv._id, "Approved")}
                                    disabled={actionLoading}
                                  >
                                    ✓ Approve
                                  </button>
                                )}
                                {adv.advocateStatus !== "Suspended" && (
                                  <button
                                    className="action-btn suspend-btn"
                                    onClick={() => handleUpdateStatus(adv._id, "Suspended")}
                                    disabled={actionLoading}
                                  >
                                    ⏸ Suspend
                                  </button>
                                )}
                                {adv.advocateStatus !== "Rejected" && (
                                  <button
                                    className="action-btn reject-btn"
                                    onClick={() => handleUpdateStatus(adv._id, "Rejected")}
                                    disabled={actionLoading}
                                  >
                                    ✕ Reject
                                  </button>
                                )}
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(adv._id, adv.fullName)}
                                  disabled={actionLoading}
                                >
                                  🗑 Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VERIFY ADVOCATE GENUINENESS TAB */}
            {activeTab === "verify" && (
              <div className="admin-section">
                <h3 className="section-title">
                  📜 Bar Council ID &amp; Advocate Genuineness Verification Portal
                </h3>
                <p className="section-subtitle">
                  Inspect advocate Bar Council credentials, enrollment record history, and calculate experience to verify authenticity before approving.
                </p>

                {pendingAdvocatesList.length === 0 ? (
                  <div className="admin-success-box">
                    🎉 All registered advocates have been reviewed! No pending verification requests in queue.
                  </div>
                ) : (
                  <div className="verification-cards-grid">
                    {pendingAdvocatesList.map((adv) => (
                      <div className="verify-card" key={adv._id}>
                        <div className="verify-card-header">
                          <span className="verify-badge">Pending Genuineness Check</span>
                          <h4>👨‍⚖ {adv.fullName}</h4>
                          <p className="verify-email">✉ {adv.email} {adv.phone ? `| 📞 ${adv.phone}` : ""}</p>
                        </div>

                        <div className="verify-details-box">
                          <div className="detail-row">
                            <span className="detail-lbl">Bar Council ID:</span>
                            <span className="detail-val id-code">📜 {adv.barCouncilId || "N/A"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-lbl">Year of Enrollment:</span>
                            <span className="detail-val">📅 {adv.enrollmentYear || "N/A"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-lbl">Calculated Experience:</span>
                            <span className="detail-val exp">🎖 {adv.experience} Years of Legal Practice</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-lbl">Account Registration:</span>
                            <span className="detail-val">{new Date(adv.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="verify-card-actions">
                          <button
                            className="verify-action-btn approve"
                            onClick={() => handleUpdateStatus(adv._id, "Approved")}
                            disabled={actionLoading}
                          >
                            ✓ Verify &amp; Approve Advocate
                          </button>
                          <button
                            className="verify-action-btn reject"
                            onClick={() => handleUpdateStatus(adv._id, "Rejected")}
                            disabled={actionLoading}
                          >
                            ✕ Reject Credential
                          </button>
                          <button
                            className="verify-action-btn suspend"
                            onClick={() => handleUpdateStatus(adv._id, "Suspended")}
                            disabled={actionLoading}
                          >
                            ⏸ Suspend
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW LOGIN INFORMATION TAB */}
            {activeTab === "logs" && (
              <div className="admin-section">
                <h3 className="section-title">🔒 Login Audit &amp; OTP Authentication Logs</h3>
                <p className="section-subtitle">
                  Real-time security log tracking user login attempts, OTP dispatches, and authentication statuses.
                </p>

                {loginLogs.length === 0 ? (
                  <div className="admin-empty-box">No login history recorded yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>User Email</th>
                          <th>User Role</th>
                          <th>Login Event Status</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginLogs.map((log) => (
                          <tr key={log._id}>
                            <td>📅 {new Date(log.createdAt).toLocaleString()}</td>
                            <td>
                              <strong>✉ {log.email}</strong>
                            </td>
                            <td>
                              <span className={`role-pill ${log.role}-pill`}>{log.role}</span>
                            </td>
                            <td>
                              <span
                                className={`log-status-pill log-${(log?.status || "unknown")
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {log?.status || "Unknown"}
                              </span>
                            </td>
                            <td>🌐 {log.ipAddress || "127.0.0.1"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;