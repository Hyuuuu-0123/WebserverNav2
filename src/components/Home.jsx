import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ros } from "roslib";

import Sidebaradmin from "./Sidebaradmin";
import Connection from "./Connection";
import Teleoperation from "./Teleoperation";
import Robotstate from "./Robotstate";
import Map from "./Map";
import Config from "../script/config";

import { Row, Col, Container } from "react-bootstrap";
import "../style/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  const rosRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true") {
      navigate("/login");
      return;
    }

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
  }, [navigate]);

  return (
    <div className="home-page">
      <Sidebaradmin />

      <section className="home-main-panel">
        <header className="home-topbar">
          <div>
            <h2 className="home-top-title">Robot Controller</h2>
            <p className="home-top-sub">ROS Web Monitoring Dashboard</p>
          </div>

          <div
            className={`home-status-badge ${
              connected ? "online" : "offline"
            }`}
          >
            <span
              className={`home-status-dot ${
                connected ? "online" : "offline"
              }`}
            ></span>
            {connected ? "System Online" : "System Disconnected"}
          </div>
        </header>

        <Container fluid className="home-container">
          <main className="home-content">
            <h1 className="text-center mb-4 home-title">
              ROBOT CONTROLLER PAGE
            </h1>

            <Row className="g-4 align-items-start justify-content-center">
              <Col lg={4} md={5} sm={12}>
                <div className="home-card">
                  <Connection />
                </div>

                <div className="home-card text-center">
                  <h4 className="home-section-title">Teleoperation</h4>
                  <Teleoperation />
                </div>

                <div className="home-card">
                  <Robotstate />
                </div>
              </Col>

              <Col lg={8} md={7} sm={12}>
                <div className="home-map-card">
                  <h3 className="home-map-title">MONITORING ROBOT SYSTEM</h3>
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