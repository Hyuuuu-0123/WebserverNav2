import React from "react";
import { useNavigate } from "react-router-dom";

import Sidebaradmin from "./Sidebaradmin";
import "../style/Aboutadmin.css";

export default function Aboutadmin() {
  const navigate = useNavigate();

  const featureCards = [
    {
      title: "ROS Web Interface",
      detail: "Connects the web dashboard with ROS-enabled robot systems.",
      icon: "🔗",
    },
    {
      title: "Real-time Monitoring",
      detail: "Displays robot status, velocity, pose, and system information.",
      icon: "📊",
    },
    {
      title: "Map Visualization",
      detail: "Supports robot map display and navigation monitoring.",
      icon: "🗺️",
    },
    {
      title: "Manual Control",
      detail: "Allows operators to control the robot through teleoperation.",
      icon: "🎮",
    },
  ];

  const stats = [
    { label: "Robot Type", val: "AMR", unit: "System", colorClass: "blue" },
    { label: "Control Rate", val: "50", unit: "Hz", colorClass: "green" },
    { label: "Platform", val: "ROS", unit: "2", colorClass: "yellow" },
    { label: "Interface", val: "Web", unit: "App", colorClass: "red" },
  ];

  return (
    <div className="about-admin-page">
      <Sidebaradmin />

      <section className="about-admin-main-panel">
        <main className="about-admin-content">
          <section className="about-admin-hero">
            <div>
              <div className="about-admin-badge">
                <span className="about-admin-badge-icon">🤖</span>
                <span className="about-admin-badge-text">
                  Graduation Thesis 2026
                </span>
              </div>

              <h1 className="about-admin-hero-title">
                Design and Implementation of an{" "}
                <span>Autonomous Mobile Robot</span> for Delivering Essential
                Items in Hotel Environments
              </h1>

              <p className="about-admin-hero-paragraph">
                Developed by member in <strong>ACISLAB</strong>, this
                intelligent service robot is tailored for modern hospitality. It
                is designed to support hotel operations by transporting
                essential items such as meals, beverages, linens, and guest
                supplies with efficiency and reliability.
              </p>

              <div className="about-admin-button-wrap">
                <button
                  onClick={() => navigate("/home")}
                  className="about-admin-main-btn"
                >
                  Go to Home →
                </button>
              </div>
            </div>

            <div className="about-admin-feature-grid">
              {featureCards.map((item, idx) => (
                <div key={idx} className="about-admin-feature-card">
                  <div className="about-admin-feature-icon">{item.icon}</div>
                  <h4 className="about-admin-feature-title">{item.title}</h4>
                  <p className="about-admin-feature-detail">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="about-admin-stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="about-admin-stat-card">
                <div className="about-admin-stat-label">{s.label}</div>
                <div className={`about-admin-stat-value ${s.colorClass}`}>
                  {s.val} <span>{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="about-admin-ready-box">
            <div className="about-admin-ready-icon">🚀</div>
            <div>
              <h3 className="about-admin-ready-title">Ready to Monitor</h3>
              <p className="about-admin-ready-text">
                The system is fully initialized and ready for real-time robot
                monitoring and control.
              </p>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}