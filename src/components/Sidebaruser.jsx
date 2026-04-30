import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Sidebaruser.css";

export default function Sidebaruser() {
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
    <aside className="sidebar-user">
      <div>
        <div className="sidebar-user-logo-box">
          <div className="sidebar-user-logo-icon">🤖</div>

          <div>
            <h3 className="sidebar-user-logo-title">ROBOT UI</h3>
            <p className="sidebar-user-logo-sub">User Panel</p>
          </div>
        </div>

        <nav className="sidebar-user-nav">
          <button
            onClick={() => navigate("/user")}
            className={
              isActive("/user")
                ? "sidebar-user-nav-btn active"
                : "sidebar-user-nav-btn"
            }
          >
            ℹ️ About
          </button>

          <button
            onClick={() => navigate("/order")}
            className={
              isActive("/order")
                ? "sidebar-user-nav-btn active"
                : "sidebar-user-nav-btn"
            }
          >
            📦 Order
          </button>

          <button
            onClick={() => navigate("/history")}
            className={
              isActive("/history")
                ? "sidebar-user-nav-btn active"
                : "sidebar-user-nav-btn"
            }
          >
            📜 History
          </button>
        </nav>
      </div>

      <div>
        <div className="sidebar-user-profile-box">
          <div className="sidebar-user-avatar">U</div>

          <div>
            <div className="sidebar-user-name">User</div>
            <div className="sidebar-user-role">Robot Customer</div>
          </div>
        </div>

        <button onClick={handleLogout} className="sidebar-user-logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}