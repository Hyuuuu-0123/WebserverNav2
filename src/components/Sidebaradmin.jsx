import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Sidebaradmin.css";

export default function Sidebaradmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <aside className="sidebar-admin">
      <div>
        <div className="sidebar-admin-logo-box">
          <div className="sidebar-admin-logo-icon">🤖</div>

          <div>
            <h3 className="sidebar-admin-logo-title">ROBOT UI</h3>
            <p className="sidebar-admin-logo-sub">Control Panel</p>
          </div>
        </div>

        <nav className="sidebar-admin-nav">
          <button
            type="button"
            onClick={() => navigate("/about")}
            className={`sidebar-admin-nav-btn ${
              isActive("/about") ? "active" : ""
            }`}
          >
            ℹ️ About
          </button>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className={`sidebar-admin-nav-btn ${
              isActive("/home") ? "active" : ""
            }`}
          >
            🏠 Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/order-manager")}
            className={`sidebar-admin-nav-btn ${
              isActive("/order-manager") ? "active" : ""
            }`}
          >
            📦 Order Manager
          </button>
        </nav>
      </div>

      <div>
        <div className="sidebar-admin-user-box">
          <div className="sidebar-admin-avatar">W</div>

          <div>
            <div className="sidebar-admin-user-name">Wii Admin</div>
            <div className="sidebar-admin-user-role">Robot Operator</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-admin-logout-btn"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}