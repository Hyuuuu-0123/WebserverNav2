import React from "react";

import logoHCMUTE from "../assets/Logo-DH-Su-Pham-Ky-Thuat-TP-Ho-Chi-Minh-HCMUTE.webp";
import logokhoa from "../assets/FAE.png";
import logoACIS from "../assets/Logo_ACISLab.png";

export default function Header() {
  return (
    <header
      style={{
        padding: "20px 60px",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <img src={logoHCMUTE} alt="HCMUTE" style={{ height: "60px" }} />
        <img src={logokhoa} alt="FAE" style={{ height: "60px" }} />
      </div>

      <div style={{ textAlign: "center", flex: 1 }}>
        <div
          style={{
            fontSize: "20px",
            color: "#0f172a",
            fontWeight: "1000",
            textTransform: "uppercase",
          }}
        >
          Ho Chi Minh City University of Technology and Engineering
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "#0f172a",
            fontWeight: "1000",
            textTransform: "uppercase",
          }}
        >
          Faculty of Advanced and Education
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "#0f172a",
            fontWeight: "1000",
            textTransform: "uppercase",
          }}
        >
          Advanced Control & Intelligent System Laboratory
        </div>
      </div>

      <img src={logoACIS} alt="ACIS" style={{ height: "65px" }} />
    </header>
  );
}