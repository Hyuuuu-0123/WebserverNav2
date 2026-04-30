import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logoHCMUTE from "../assets/Logo-DH-Su-Pham-Ky-Thuat-TP-Ho-Chi-Minh-HCMUTE.webp";
import logoACIS from "../assets/Logo_ACISLab.png";
import logoFAE from "../assets/FAE.png";
import robotImg from "../assets/Screenshot_from_2026-04-22_19-38-27-removebg-preview(1).png";
import background from "../assets/background.jpeg";

import "../style/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username: user,
        password: pass,
      });

      if (res.data.success) {
        const loginUser = res.data.user;

        localStorage.setItem("isLogin", "true");
        localStorage.setItem("user", JSON.stringify(loginUser));

        if (loginUser.username === "admin") {
          setMessage("✅ Welcome, Administrator");
          localStorage.setItem("userRole", "admin");

          setTimeout(() => {
            navigate("/about");
          }, 800);
        } else {
          setMessage("✅ Welcome, User");
          localStorage.setItem("userRole", "user");

          setTimeout(() => {
            navigate("/user");
          }, 800);
        }
      }
    } catch (err) {
      setMessage("❌ Access Denied: Incorrect credentials.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="login-overlay"></div>

      <div className="login-main">
        <div className="login-robot-side">
          <div className="login-deco-circle" />
          <img src={robotImg} alt="Robot" className="login-robot-img" />
        </div>

        <div className="login-form-side">
          <div className="login-logo-header">
            <div className="login-logo-left">
              <img src={logoHCMUTE} alt="HCMUTE" className="login-logo" />
              <div className="login-logo-divider"></div>
              <img src={logoFAE} alt="FAE" className="login-logo" />
            </div>

            <img src={logoACIS} alt="ACIS Lab" className="login-acis-logo" />
          </div>

          <div className="login-form-content">
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Operator dashboard authorization</p>

            <form className="login-form">
              <div className="login-field">
                <label className="login-label">OPERATOR/USER ID</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="login-input"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="login-field password">
                <label className="login-label">ACCESS KEY</label>

                <div className="login-password-box">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-input"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="login-eye-btn"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="login-btn"
              >
                LOG IN TO DASHBOARD →
              </button>
            </form>

            {message && (
              <p
                className={`login-message ${
                  message.includes("✅") ? "success" : "error"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="login-footer">
        FAE - HCMUTE | Graduation Thesis Project 2026 | AMR System Control
      </footer>
    </div>
  );
}