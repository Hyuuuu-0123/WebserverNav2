import React from "react";
import { useNavigate } from "react-router-dom";

export default function Aboutuser() {
  const navigate = useNavigate();

  return (
    <main className="user-content">
      <section className="user-hero">
        <div>
          <div className="user-badge">
            <span className="user-badge-icon">🤖</span>
            <span className="user-badge-text">Graduation Thesis 2026</span>
          </div>

          <h1 className="user-hero-title">
            Design and Implementation of an{" "}
            <span>Autonomous Mobile Robot</span> for Delivering Essential Items
            in Hotel Environments
          </h1>

          <p className="user-hero-paragraph">
            Developed by member in <strong>ACISLAB</strong>, this intelligent
            service robot is tailored for modern hospitality. It is designed to
            support hotel operations by transporting essential items such as
            meals, beverages, linens, and guest supplies with efficiency and
            reliability.
          </p>

          <div className="user-button-group">
            <button onClick={() => navigate("/order")} className="user-main-btn">
              Create Order →
            </button>

            <button
              onClick={() => navigate("/history")}
              className="user-secondary-btn"
            >
              View History →
            </button>
          </div>
        </div>

        <div className="user-feature-grid">
          <div className="user-feature-card">
            <div className="user-feature-icon">📦</div>
            <h4 className="user-feature-title">Create Order</h4>
            <p className="user-feature-detail">
              Submit delivery information and send a request to the robot
              system.
            </p>
          </div>

          <div className="user-feature-card">
            <div className="user-feature-icon">📜</div>
            <h4 className="user-feature-title">Order History</h4>
            <p className="user-feature-detail">
              View previous delivery requests, receiver rooms, and order status.
            </p>
          </div>

          <div className="user-feature-card">
            <div className="user-feature-icon">🔐</div>
            <h4 className="user-feature-title">Secure Cabinet</h4>
            <p className="user-feature-detail">
              Use password and face detection protection for important items
              during delivery.
            </p>
          </div>

          <div className="user-feature-card">
            <div className="user-feature-icon">🤖</div>
            <h4 className="user-feature-title">Robot Service</h4>
            <p className="user-feature-detail">
              The robot receives delivery tasks and supports automated
              transport.
            </p>
          </div>
        </div>
      </section>

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="user-stat-label">Robot Type</div>
          <div className="user-stat-value blue">AMR</div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-label">Order Mode</div>
          <div className="user-stat-value green">Manual</div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-label">Cabinet</div>
          <div className="user-stat-value yellow">1 - 3</div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-label">System</div>
          <div className="user-stat-value red">Web</div>
        </div>
      </div>

      <div className="user-ready-box">
        <div className="user-ready-icon">🚀</div>

        <div>
          <h3 className="user-ready-title">Ready to Create Delivery</h3>
          <p className="user-ready-text">
            Choose Order to create a new robot delivery request, or open History
            to review previous orders.
          </p>
        </div>
      </div>
    </main>
  );
}