import React, { Component } from "react";
import { Container } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
    //   <footer style={footerStyle}>
        <Container className="text-center">
          <p style={textStyle}>
            <span style={brandStyle}>ACIS LAB</span>
            <span style={dotStyle}> • </span>
            ROBOTWEBSERVER © 2026
          </p>
        </Container>
    //   </footer>
    );
  }
}


const textStyle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "900",
  letterSpacing: "0.5px",
  color: "#64748b",
};

const brandStyle = {
  color: "#166534",
};

const dotStyle = {
  color: "#cbd5e1",
  margin: "0 8px",
};

export default Footer;