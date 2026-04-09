import { useState, useEffect } from "react";
import api from "../api";

export default function Navbar() {
  const [profile, setProfile] = useState({
    username: "Loading...",
    role: "user",
    shopName: "Hardware Hub"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // We use the new /admin/profile endpoint we created for isolation
        const res = await api.get("/admin/profile");
        setProfile({
          username: res.data.username,
          role: res.data.role,
          shopName: res.data.shopName || "Hardware Hub"
        });
      } catch (err) {
        console.error("Session expired or network error");
      }
    };

    fetchProfile();
  }, []);

  const logout = async () => {
    // Clear tokens and shop info from storage
    if (!window.confirm("Are you sure you want to log out?")) return;

  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.log("Logout API error:", err);
  }
    localStorage.removeItem("token");
    localStorage.removeItem("shopInfo");
    window.location = "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="shop-icon">🏬</span>
        <div className="brand-text">
          <h3 className="shop-name">{profile.shopName}</h3>
          <span className="system-tag">POS System</span>
        </div>
      </div>

      <div className="nav-user-section">
        <div className="user-info">
          <span className="user-badge">
            {profile.role === 'admin' ? '🛡️ Admin' : '👤 Operator'}
          </span>
          <strong className="username">{profile.username}</strong>
        </div>
        <button className="logout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>

      <style jsx>{`
        .navbar {
          background: #2c3e50; /* Professional Dark Theme */
          color: white;
          padding: 10px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: 'Inter', sans-serif;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .shop-icon { font-size: 1.5rem; }
        .shop-name { margin: 0; font-size: 1.2rem; letter-spacing: 0.5px; }
        .system-tag { font-size: 0.65rem; color: #bdc3c7; text-transform: uppercase; }
        
        .nav-user-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-badge {
          font-size: 0.6rem;
          background: rgba(255,255,255,0.1);
          padding: 2px 8px;
          border-radius: 10px;
          margin-bottom: 2px;
        }
        .username { font-size: 0.9rem; color: #ecf0f1; }
        
        .logout-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: 0.3s;
        }
        .logout-btn:hover {
          background: #c0392b;
          box-shadow: 0 0 10px rgba(231, 76, 60, 0.4);
        }

        @media (max-width: 600px) {
          .system-tag, .user-badge { display: none; }
          .shop-name { font-size: 1rem; }
        }
      `}</style>
    </nav>
  );
}