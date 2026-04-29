import React from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
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
    { label: "Robot Type", val: "AMR", unit: "System", color: "#3b82f6" },
    { label: "Control Rate", val: "50", unit: "Hz", color: "#22c55e" },
    { label: "Platform", val: "ROS", unit: "2", color: "#f59e0b" },
    { label: "Interface", val: "Web", unit: "App", color: "#ef4444" },
  ];

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <div>
          <div style={logoBoxStyle}>
            <div style={logoIconStyle}>🤖</div>
            <div>
              <h3 style={logoTitleStyle}>ROBOT UI</h3>
              <p style={logoSubStyle}>Control Panel</p>
            </div>
          </div>

          <nav style={navStyle}>
            <button
              onClick={() => navigate("/about")}
              style={activeNavButtonStyle}
            >
              ℹ️ About
            </button>

            <button onClick={() => navigate("/home")} style={navButtonStyle}>
              🏠 Home
            </button>
          </nav>
        </div>

        <div style={userBoxStyle}>
          <div style={avatarStyle}>W</div>
          <div>
            <div style={userNameStyle}>Wii Admin</div>
            <div style={userRoleStyle}>Robot Operator</div>
          </div>
        </div>
      </aside>

      <section style={mainPanelStyle}>
        <main style={{ padding: "26px 0" }}>
          <section style={heroStyle}>
            <div>
              <div style={badgeStyle}>
                <span style={{ fontSize: "18px" }}>🤖</span>
                <span style={badgeTextStyle}>Graduation Thesis 2026</span>
              </div>

              <h1 style={heroTitleStyle}>
                Design and Implementation of an{" "}
                <span style={{ color: "#3b82f6" }}>
                  Autonomous Mobile Robot
                </span>{" "}
                for Delivering Essential Items in Hotel Environments
              </h1>

              <p style={heroParagraphStyle}>
                Developed by member in <strong>ACISLAB</strong>, this
                intelligent service robot is tailored for modern hospitality. It
                is designed to support hotel operations by transporting
                essential items such as meals, beverages, linens, and guest
                supplies with efficiency and reliability. With autonomous indoor
                navigation and real-time obstacle awareness, the robot helps
                optimize workflows, reduce manual workload, and enhance the
                overall service experience for both staff and guests.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/home")}
                  style={mainButtonStyle}
                >
                  Go to Home →
                </button>
              </div>
            </div>

            <div style={featureGridStyle}>
              {featureCards.map((item, idx) => (
                <div key={idx} style={featureCardStyle}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                    {item.icon}
                  </div>

                  <h4 style={featureTitleStyle}>{item.title}</h4>
                  <p style={featureDetailStyle}>{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={statsGridStyle}>
            {stats.map((s, i) => (
              <div key={i} style={statCardStyle}>
                <div style={statLabelStyle}>{s.label}</div>

                <div style={{ ...statValueStyle, color: s.color }}>
                  {s.val}{" "}
                  <span style={{ fontSize: "13px", color: "#cbd5e1" }}>
                    {s.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={readyBoxStyle}>
            <div style={readyIconStyle}>🚀</div>

            <div>
              <h3 style={readyTitleStyle}>Ready to Monitor</h3>
              <p style={readyTextStyle}>
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

const pageStyle = {
  background: "#f8fafc",
  minHeight: "100vh",
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
  display: "flex",
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const sidebarStyle = {
  width: "245px",
  minHeight: "100vh",
  background: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  padding: "26px 18px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "8px 0 30px rgba(15, 23, 42, 0.06)",
};

const mainPanelStyle = {
  flex: 1,
  padding: "24px 32px",
  overflowX: "hidden",
};

const logoBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "36px",
};

const logoIconStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "16px",
  background: "#dcfce7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

const logoTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "900",
  color: "#0f172a",
};

const logoSubStyle = {
  margin: "2px 0 0 0",
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "600",
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const navButtonStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderRadius: "16px",
  background: "transparent",
  color: "#475569",
  fontSize: "15px",
  fontWeight: "800",
  textAlign: "left",
  cursor: "pointer",
};

const activeNavButtonStyle = {
  ...navButtonStyle,
  background: "#dcfce7",
  color: "#166534",
};

const userBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#bbf7d0",
  color: "#166534",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
};

const userNameStyle = {
  fontSize: "14px",
  fontWeight: "900",
  color: "#0f172a",
};

const userRoleStyle = {
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
};

const heroStyle = {
  marginBottom: "40px",
  padding: "60px",
  background: "#ffffff",
  borderRadius: "40px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.03)",
  border: "1px solid #e2e8f0",
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "50px",
  alignItems: "center",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  background: "#f0f7ff",
  padding: "8px 18px",
  borderRadius: "100px",
  marginBottom: "20px",
};

const badgeTextStyle = {
  fontSize: "20px",
  fontWeight: "1000",
  color: "#3b82f6",
  textTransform: "uppercase",
};

const heroTitleStyle = {
  fontSize: "40px",
  fontWeight: "900",
  color: "#0f172a",
  lineHeight: "1.1",
  margin: "0 0 25px 0",
  letterSpacing: "-0.5px",
  textAlign: "justify",
  textJustify: "inter-word",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const heroParagraphStyle = {
  fontSize: "20px",
  color: "#0f172a",
  fontWeight: "1000",
  lineHeight: "1.8",
  marginBottom: "35px",
  textAlign: "justify",
  letterSpacing: "0.3px",
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const mainButtonStyle = {
  padding: "25px 180px",
  background: "#0f172a",
  color: "#fff",
  borderRadius: "16px",
  fontSize: "17px",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
};

const featureGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  width: "100%",
};

const featureCardStyle = {
  background: "#f8fafc",
  padding: "24px",
  borderRadius: "24px",
  border: "1px solid #eff6ff",
  minHeight: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const featureTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#0f172a",
  margin: "0 0 10px 0",
  lineHeight: "1.2",
};

const featureDetailStyle = {
  fontSize: "14px",
  color: "#64748b",
  margin: 0,
  lineHeight: "1.5",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "25px",
  marginBottom: "40px",
};

const statCardStyle = {
  background: "#fff",
  padding: "25px 15px",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  textAlign: "center",
};

const statLabelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "700",
  marginBottom: "5px",
  textTransform: "uppercase",
};

const statValueStyle = {
  fontSize: "26px",
  fontWeight: "900",
};

const readyBoxStyle = {
  background: "#ffffff",
  borderRadius: "28px",
  padding: "30px 36px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  marginBottom: "40px",
};

const readyIconStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  background: "#dcfce7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};

const readyTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
  color: "#0f172a",
};

const readyTextStyle = {
  margin: "6px 0 0 0",
  fontSize: "15px",
  fontWeight: "600",
  color: "#64748b",
};