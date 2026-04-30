import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./header";
import Footer from "./footer";

import Login from "./Login";
import Home from "./Home";
import Aboutadmin from "./Aboutadmin";
import User from "./User";
import Order from "./Order";
import History from "./History";
import OrderManager from "./OrderManager";

export default function Body() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/about"
        element={
          <>
            <Header />
            <Aboutadmin />
            <Footer />
          </>
        }
      />

      <Route
        path="/home"
        element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        }
      />

      <Route path="/user" element={<User />} />
      <Route path="/order" element={<Order />} />
      <Route path="/history" element={<History />} />

      <Route
        path="/order-manager"
        element={
          <>
            <Header />
            <OrderManager />
            <Footer />
          </>
        }
      />
    </Routes>
  );
}