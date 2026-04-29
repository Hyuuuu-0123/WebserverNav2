import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ros } from "roslib";

import Connection from "./Connection";
import Teleoperation from "./Teleoperation";
import Robotstate from "./Robotstate";
import Map from "./Map";
import Config from "../script/config";

import { Row, Col, Container } from "react-bootstrap";

export default function Home() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  const rosRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    const connectROS = () => {
      const ros = new Ros();
      rosRef.current = ros;

      ros.on("connection", () => {
        console.log("connection established in Home!");
        setConnected(true);
      });

      ros.on("close", () => {
        console.log("connection closed in Home!");
        setConnected(false);

        reconnectTimerRef.current = setTimeout(() => {
          try {
            ros.connect(
              "ws://" +
                Config.ROSBRIDGE_IP_SERVER +
                ":" +
                Config.ROSBRIDGE_IP_PORT
            );
          } catch (error) {
            console.log("connection problem:", error);
          }
        }, Config.RECONNECTION_TIMER);
      });

      ros.on("error", (error) => {
        console.log("connection error in Home:", error);
        setConnected(false);
      });

      try {
        ros.connect(
          "ws://" + Config.ROSBRIDGE_IP_SERVER + ":" + Config.ROSBRIDGE_IP_PORT
        );
      } catch (error) {
        console.log("initial connection problem:", error);
      }
    };

    connectROS();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, []);

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
            <button onClick={() => navigate("/about")} style={navButtonStyle}>
              ℹ️ About
            </button>

            <button
              onClick={() => navigate("/home")}
              style={activeNavButtonStyle}
            >
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
        <header style={topBarStyle}>
          <div>
            <h2 style={topTitleStyle}>Robot Controller</h2>
            <p style={topSubStyle}>ROS Web Monitoring Dashboard</p>
          </div>

          <div
            style={{
              ...statusBadgeStyle,
              background: connected ? "#dcfce7" : "#fee2e2",
              color: connected ? "#166534" : "#991b1b",
            }}
          >
            <span
              style={{
                ...statusDotStyle,
                background: connected ? "#22c55e" : "#ef4444",
              }}
            ></span>

            {connected ? "System Online" : "System Disconnected"}
          </div>
        </header>

        <Container fluid style={{ padding: 0, margin: 0, maxWidth: "100%" }}>
          <main style={{ width: "100%" }}>
            <h1 className="text-center mb-4" style={titleStyle}>
              ROBOT CONTROLLER PAGE
            </h1>

            <Row className="g-4 align-items-start justify-content-center">
              <Col lg={4} md={5} sm={12}>
                <div style={cardStyle}>
                  <Connection />
                </div>

                <div style={{ ...cardStyle, textAlign: "center" }}>
                  <h4 style={sectionTitleStyle}>Teleoperation</h4>
                  <Teleoperation />
                </div>

                <div style={cardStyle}>
                  <Robotstate />
                </div>
              </Col>

              <Col lg={8} md={7} sm={12}>
                <div style={mapCardStyle}>
                  <h3 style={mapTitleStyle}>MONITORING ROBOT SYSTEM</h3>
                  <Map />
                </div>
              </Col>
            </Row>
          </main>
        </Container>
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

const topBarStyle = {
  height: "76px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "22px",
  padding: "0 24px",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
};

const topTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "900",
};

const topSubStyle = {
  margin: "4px 0 0 0",
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
};

const statusBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "10px 16px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "800",
};

const statusDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "50%",
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

const titleStyle = {
  fontWeight: "900",
  color: "#0f172a",
  letterSpacing: "3px",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontWeight: "800",
  marginBottom: "18px",
  color: "#0f172a",
};

const mapTitleStyle = {
  fontWeight: "900",
  color: "#0f172a",
  marginBottom: "16px",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
  marginBottom: "22px",
};

const mapCardStyle = {
  ...cardStyle,
  minHeight: "720px",
};