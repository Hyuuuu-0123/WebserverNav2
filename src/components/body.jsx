import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import About from "./About";

class Body extends Component {
  render() {
    return (
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Container>
    );
  }
}

export default Body;