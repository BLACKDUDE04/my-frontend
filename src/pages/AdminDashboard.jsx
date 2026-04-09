import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [ads, setAds] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  // Professional Stats
  const stats = useMemo(() => ({
    totalNodes: users.length,
    activeLicenses: users.filter(u => u.active).length,
    livePromotions: ads.length,
  }), [users, ads]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await api.get("/ads");
      setAds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAds();

    socketRef.current = io("http://localhost:5000");
    const socket = socketRef.current;

    socket.on("usersUpdated", fetchUsers);
    socket.on("adsUpdated", fetchAds);

    return () => {
      socket.off("usersUpdated", fetchUsers);
      socket.off("adsUpdated", fetchAds);
      socket.disconnect();
    };
  }, []);

  // Actions
  const handleUpdateScreens = async (userId, count) => {
    if (!count) return;
    try {
      await api.put(`/admin/update-screens/${userId}`, { screenCount: parseInt(count) });
      fetchUsers();
    } catch (err) {
      alert("Failed to update screen allocation");
    }
  };

  const handleUpdateSessions = async (userId, count) => {
    try {
      await api.put(`/admin/update-sessions/${userId}`, { activeSessions: parseInt(count) });
      fetchUsers();
    } catch (err) {
      alert("Failed to update session limit");
    }
  };

  const toggleAccess = async (id, currentStatus) => {
    try {
      const action = currentStatus ? "disable" : "enable";
      await api.put(`/admin/${action}/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Access update failed. Please check permissions.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this operator? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/delete-user/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      return alert("Please provide both username and password.");
    }
    try {
      await api.post("/admin/create-user", newUser);
      setNewUser({ username: "", password: "" });
      fetchUsers();
      alert("New operator account created successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to provision new terminal.");
    }
  };

  const handleAdUpload = async () => {
    if (!file) return alert("Please select a banner image.");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await api.post("/ads/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchAds();
      alert("Promotion successfully broadcast to all connected terminals.");
    } catch (err) {
      alert("Failed to upload promotion.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAd = async (id) => {
    if (!window.confirm("Remove this promotion from the network?")) return;
    try {
      await api.delete(`/ads/${id}`);
      fetchAds();
    } catch (err) {
      alert("Failed to remove promotion.");
    }
  };

  return (
    <div className="admin-dashboard">
      <Navbar title="Enterprise Control Center" subtitle="System Administration" />

      <div className="dashboard-container">
        {/* Professional Metrics */}
        <div className="metrics-section">
          <div className="metric-card" style={{ animationDelay: "0.1s" }}>
            <div className="metric-header">
              <span className="metric-icon">🖥️</span>
              <span className="metric-label">Registered Nodes</span>
            </div>
            <div className="metric-value">{stats.totalNodes}</div>
          </div>

          <div className="metric-card accent-green" style={{ animationDelay: "0.2s" }}>
            <div className="metric-header">
              <span className="metric-icon">✅</span>
              <span className="metric-label">Active Licenses</span>
            </div>
            <div className="metric-value">{stats.activeLicenses}</div>
          </div>

          <div className="metric-card accent-blue" style={{ animationDelay: "0.3s" }}>
            <div className="metric-header">
              <span className="metric-icon">📢</span>
              <span className="metric-label">Active Promotions</span>
            </div>
            <div className="metric-value">{stats.livePromotions}</div>
          </div>
        </div>

        <div className="main-grid">
          {/* Operator Management */}
          <div className="panel operator-panel">
            <div className="panel-header">
              <h2>Operator Directory</h2>
              <p className="panel-subtitle">Manage terminal access, screen permissions, and session limits</p>
            </div>

            <div className="table-container">
              {loading ? (
                <div className="loading-state">Loading operator data...</div>
              ) : users.length === 0 ? (
                <div className="empty-state">No operators registered yet.</div>
              ) : (
                <div className="user-list">
                  {users.map((user, index) => (
                    <div key={user._id} className="user-row" style={{ animationDelay: `${index * 0.04}s` }}>
                      <div className="user-info">
                        <div className={`status-dot ${user.loggedIn ? 'online' : 'offline'}`} />
                        <div>
                          <div className="user-name">{user.username}</div>
                          <div className="user-role">{user.role || "Terminal Operator"}</div>
                        </div>
                      </div>

                      <div className="user-controls">
                        <div className="control-box">
                          <label>Screens</label>
                          <input
                            type="number"
                            min="1"
                            max="16"
                            defaultValue={user.screenCount || 1}
                            onBlur={(e) => handleUpdateScreens(user._id, e.target.value)}
                            className="control-input"
                          />
                        </div>

                        <div className="control-box">
                          <label>Max Sessions</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={user.activeSessions || 0}
                            onChange={(e) => {
                              setUsers(prev => prev.map(u => 
                                u._id === user._id ? { ...u, activeSessions: Number(e.target.value) } : u
                              ));
                            }}
                            onBlur={() => handleUpdateSessions(user._id, user.activeSessions)}
                            className="control-input"
                          />
                        </div>

                        <div className={`access-status ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? "Authorized" : "Access Revoked"}
                        </div>

                        {user.role !== "admin" && (
                          <div className="action-group">
                            <button
                              className={`btn ${user.active ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => toggleAccess(user._id, user.active)}
                            >
                              {user.active ? "Revoke" : "Authorize"}
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteUser(user._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provision New Operator */}
            <div className="provision-card">
              <h3>Provision New Terminal</h3>
              <div className="provision-form">
                <input
                  type="text"
                  placeholder="Username / Node ID"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="form-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="form-input"
                />
                <button onClick={handleCreateUser} className="btn btn-primary">
                  Deploy Terminal
                </button>
              </div>
            </div>
          </div>

          {/* Media Management */}
          <div className="panel media-panel">
            <div className="panel-header">
              <h2>Media Broadcast Center</h2>
              <p className="panel-subtitle">Manage promotional content across the network</p>
            </div>

            <div className="upload-zone">
              <input
                type="file"
                id="ad-upload"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                hidden
              />
              <label htmlFor="ad-upload" className="upload-label">
                {file ? `Selected: ${file.name}` : "Upload Promotion Banner (JPG / PNG)"}
              </label>
              <button
                onClick={handleAdUpload}
                disabled={!file || isUploading}
                className="btn btn-primary upload-button"
              >
                {isUploading ? "Broadcasting..." : "Broadcast to All Terminals"}
              </button>
            </div>

            <div className="media-grid">
              {ads.length === 0 ? (
                <div className="empty-media">No active promotions</div>
              ) : (
                ads.map((ad, i) => (
                  <div key={ad._id} className="media-item" style={{ animationDelay: `${i * 0.06}s` }}>
                    <img src={`http://localhost:5000${ad.imageUrl}`} alt="Promotion" />
                    <button className="delete-media-btn" onClick={() => removeAd(ad._id)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          background: #0f172a;
          color: #e2e8f0;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .dashboard-container {
          max-width: 1480px;
          margin: 0 auto;
          padding: 40px 32px;
        }

        .metrics-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .metric-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 28px 32px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease forwards;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(129, 140, 248, 0.4);
        }

        .accent-green { border-top: 4px solid #22c55e; }
        .accent-blue { border-top: 4px solid #3b82f6; }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric-icon {
          font-size: 28px;
        }

        .metric-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 3.2rem;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .panel {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(10px);
        }

        .panel-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .panel-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        /* User Rows */
        .user-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
          padding: 20px 24px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.1);
          transition: all 0.2s ease;
          animation: fadeInUp 0.5s ease forwards;
        }

        .user-row:hover {
          background: rgba(255,255,255,0.06);
          transform: translateX(6px);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #22c55e;
          box-shadow: 0 0 12px #22c55e;
        }

        .status-dot.offline {
          background: #64748b;
        }

        .user-name {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-role {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .control-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .control-box label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .control-input {
          width: 68px;
          padding: 6px 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(148,163,184,0.3);
          border-radius: 8px;
          color: white;
          text-align: center;
          font-weight: 600;
        }

        .access-status {
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .access-status.active {
          background: rgba(34, 197, 94, 0.15);
          color: #86efac;
        }

        .access-status.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(90deg, #6366f1, #818cf8);
          color: white;
        }

        .btn-success { background: #22c55e; color: white; }
        .btn-warning { background: #eab308; color: #1e2937; }
        .btn-danger { background: #ef4444; color: white; }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        /* Provision Card */
        .provision-card {
          margin-top: 32px;
          background: rgba(255,255,255,0.04);
          padding: 28px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.2);
        }

        .provision-form {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .form-input {
          flex: 1;
          padding: 14px 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(148,163,184,0.3);
          border-radius: 10px;
          color: white;
        }

        /* Media Upload */
        .upload-zone {
          border: 2px dashed #475569;
          border-radius: 16px;
          padding: 48px 32px;
          text-align: center;
          margin-bottom: 32px;
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: #818cf8;
        }

        .upload-label {
          display: block;
          margin-bottom: 20px;
          color: #cbd5e1;
          font-weight: 500;
          cursor: pointer;
        }

        .upload-button {
          width: 100%;
          padding: 16px;
          font-size: 1.05rem;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }

        .media-item {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(148,163,184,0.2);
          animation: fadeInUp 0.6s ease forwards;
        }

        .media-item img {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }

        .delete-media-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .empty-state, .empty-media, .loading-state {
          text-align: center;
          padding: 80px 20px;
          color: #94a3b8;
          font-style: italic;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1100px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}