import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "./header";
import Footer from "./footer";
import Sidebaruser from "./Sidebaruser";
import "../style/Order.css";

export default function Order() {
  const navigate = useNavigate();

  const emptyForm = {
    sender_room: "",
    receiver_name: "",
    receiver_room: "",
    item_name: "",
    quantity: "",
    cabinet_number: "",
    password: "",
    note: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [unlockPasswords, setUnlockPasswords] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [message, setMessage] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");

  const senderRooms = [
    "HOME",
    "ROOM100",
    "ROOM101",
    "ROOM102",
    "ROOM103",
    "ROOM104",
    "ROOM105",
  ];

  const receiverRooms = [
    "ROOM100",
    "ROOM101",
    "ROOM102",
    "ROOM103",
    "ROOM104",
    "ROOM105",
  ];

  const hotelItems = [
    { name: "Water Bottle", icon: "💧" },
    { name: "Towel", icon: "🧺" },
    { name: "Toothbrush", icon: "🪥" },
    { name: "Toothpaste", icon: "🦷" },
    { name: "Shampoo", icon: "🧴" },
    { name: "Soap", icon: "🧼" },
    { name: "Slippers", icon: "🥿" },
    { name: "Blanket", icon: "🛏️" },
    { name: "Pillow", icon: "🛌" },
    { name: "Tissue", icon: "🧻" },
    { name: "Coffee", icon: "☕" },
    { name: "Tea", icon: "🍵" },
    { name: "Snack", icon: "🍪" },
    { name: "Room Key Card", icon: "🔑" },
    { name: "Other", icon: "📦" },
  ];

  const cabinets = ["1", "2", "3"];

  useEffect(() => {
    fetchSubmittedOrders();

    const interval = setInterval(fetchSubmittedOrders, 1000);

    return () => clearInterval(interval);
  }, []);

  const showTempMessage = (setter, text) => {
    setter(text);
    setTimeout(() => setter(""), 2000);
  };

  const resetForm = () => {
    setForm(emptyForm);
  };

  const isFormValid = () => {
    return (
      form.sender_room &&
      form.receiver_name &&
      form.receiver_room &&
      form.item_name &&
      Number(form.quantity) > 0 &&
      form.cabinet_number
    );
  };

  const getItemIcon = (itemName) => {
    const item = hotelItems.find((item) => item.name === itemName);
    return item ? item.icon : "📦";
  };

  const fetchSubmittedOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");

      const activeOrders = Array.isArray(res.data.data)
        ? res.data.data.filter(
            (order) =>
              order.status === "submitted" ||
              order.status === "running" ||
              order.status === "arrived" ||
              order.status === "delivering"
          )
        : [];

      setSubmittedOrders(activeOrders);
    } catch (err) {
      console.log("Failed to fetch orders:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      if (value === "") {
        setForm({
          ...form,
          [name]: "",
        });
        return;
      }

      const safeValue = Math.max(1, Number(value));

      setForm({
        ...form,
        [name]: String(safeValue),
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleAddOrder = async () => {
    if (!isFormValid()) {
      showTempMessage(
        setMessage,
        "❌ Please select sender room, receiver room, item, quantity, cabinet and enter customer information"
      );
      return;
    }

    try {
      const orderPayload = {
        ...form,
        quantity: Number(form.quantity) || 1,
        status: "pending",
      };

      await axios.post("http://localhost:5000/api/orders", orderPayload);

      showTempMessage(
        setMessage,
        "✅ Order created successfully. Please wait for admin confirmation."
      );

      resetForm();
      fetchSubmittedOrders();
    } catch (err) {
      console.log("Create order error:", err);
      showTempMessage(setMessage, "❌ Failed to create order");
    }
  };

  const handleUnlockCabinet = async (order) => {
    const inputPassword = unlockPasswords[order.id] || "";

    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/${order.id}/unlock`,
        {
          password: inputPassword,
        }
      );

      if (res.data.success) {
        showTempMessage(
          setUnlockMessage,
          "✅ Cabinet unlocked successfully. Robot will continue."
        );

        setUnlockPasswords({
          ...unlockPasswords,
          [order.id]: "",
        });

        fetchSubmittedOrders();
      }
    } catch (err) {
      showTempMessage(setUnlockMessage, "❌ Wrong password");
    }
  };

  const handleKeypadPress = (orderId, value) => {
    setUnlockPasswords({
      ...unlockPasswords,
      [orderId]: (unlockPasswords[orderId] || "") + value,
    });
  };

  const handleKeypadClear = (orderId) => {
    setUnlockPasswords({
      ...unlockPasswords,
      [orderId]: "",
    });
  };

  const handleKeypadBackspace = (orderId) => {
    const current = unlockPasswords[orderId] || "";

    setUnlockPasswords({
      ...unlockPasswords,
      [orderId]: current.slice(0, -1),
    });
  };

  const toggleShowPassword = (orderId) => {
    setShowPasswords({
      ...showPasswords,
      [orderId]: !showPasswords[orderId],
    });
  };

  return (
    <>
      <Header />

      <div className="order-page">
        <Sidebaruser />

        <section className="order-main-panel">
          <div className="order-topbar">
            <div>
              <h2 className="order-top-title">Create Delivery Order</h2>
              <p className="order-top-sub">
                Select hotel item, room and cabinet to create a delivery order.
                Admin will submit the order to robot system.
              </p>
            </div>
          </div>

          <main className="order-content">
            <section className="order-form-card">
              <h1 className="order-title">ORDER INFORMATION</h1>

              <div className="order-grid">
                <div>
                  <label className="order-label">Sender Room</label>
                  <select
                    name="sender_room"
                    value={form.sender_room}
                    onChange={handleChange}
                    className="order-input"
                  >
                    <option value="">-- Select sender room --</option>
                    {senderRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="order-label">Customer Information</label>
                  <input
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={handleChange}
                    placeholder="Enter customer information"
                    className="order-input"
                  />
                </div>

                <div>
                  <label className="order-label">Receiver Room</label>
                  <select
                    name="receiver_room"
                    value={form.receiver_room}
                    onChange={handleChange}
                    className="order-input"
                  >
                    <option value="">-- Select receiver room --</option>
                    {receiverRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="order-label">Item / Service</label>
                  <select
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    className="order-input"
                  >
                    <option value="">-- Select item --</option>
                    {hotelItems.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.icon} {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="order-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    className="order-input"
                  />
                </div>

                <div>
                  <label className="order-label">Cabinet Number</label>
                  <select
                    name="cabinet_number"
                    value={form.cabinet_number}
                    onChange={handleChange}
                    className="order-input"
                  >
                    <option value="">-- Select cabinet --</option>
                    {cabinets.map((cabinet) => (
                      <option key={cabinet} value={cabinet}>
                        Cabinet {cabinet}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="order-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Optional password for cabinet"
                    className="order-input"
                  />
                </div>

                <div>
                  <label className="order-label">Note</label>
                  <input
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Note"
                    className="order-input"
                  />
                </div>
              </div>

              {message && (
                <p
                  className={`order-message ${
                    message.includes("✅") ? "success" : "error"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="order-button-row">
                <button
                  type="button"
                  onClick={handleAddOrder}
                  className="order-btn add"
                >
                  Add Order +
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="order-btn secondary"
                >
                  View History
                </button>
              </div>

              <div className="order-list">
                <h3 className="order-list-title">Robot Delivery Status</h3>

                {submittedOrders.length === 0 ? (
                  <p className="order-empty">No active robot delivery yet.</p>
                ) : (
                  <div className="order-status-list">
                    {submittedOrders.map((order) => (
                      <div key={order.id} className="order-status-card">
                        <h4 className="order-status-title">
                          {order.receiver_name} - {order.receiver_room}
                        </h4>

                        <p className="order-status-text">
                          Item: {getItemIcon(order.item_name)}{" "}
                          {order.item_name || "N/A"} | Quantity:{" "}
                          {order.quantity || 1}
                        </p>

                        <p className="order-status-text">
                          Sender: {order.sender_room} | Cabinet{" "}
                          {order.cabinet_number}
                        </p>

                        <p className="order-status-text">
                          Status:{" "}
                          <span className={`order-badge ${order.status}`}>
                            {String(order.status).toUpperCase()}
                          </span>
                        </p>

                        {order.status === "submitted" && (
                          <p className="order-waiting">
                            ✅ Admin submitted this order. Waiting for robot.
                          </p>
                        )}

                        {(order.status === "running" ||
                          order.status === "delivering") && (
                          <p className="order-waiting">
                            🚚 Robot is moving to {order.receiver_room}. Please
                            wait.
                          </p>
                        )}

                        {order.status === "arrived" && (
                          <div className="unlock-box">
                            <div className="unlock-header">
                              <div className="unlock-icon">🔐</div>

                              <div>
                                <p className="unlock-title">
                                  Robot arrived at {order.receiver_room}
                                </p>

                                <p className="unlock-sub">
                                  {order.password
                                    ? `Enter password to open Cabinet ${order.cabinet_number}`
                                    : `No password required. Confirm to open Cabinet ${order.cabinet_number}`}
                                </p>

                                <p className="unlock-sub">
                                  Item: {getItemIcon(order.item_name)}{" "}
                                  {order.item_name || "N/A"} | Quantity:{" "}
                                  {order.quantity || 1}
                                </p>
                              </div>
                            </div>

                            {order.password ? (
                              <>
                                <div className="password-row">
                                  <input
                                    type={
                                      showPasswords[order.id]
                                        ? "text"
                                        : "password"
                                    }
                                    readOnly
                                    placeholder="Enter password"
                                    value={unlockPasswords[order.id] || ""}
                                    className="order-input password-display"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleShowPassword(order.id)
                                    }
                                    className="eye-btn"
                                  >
                                    {showPasswords[order.id] ? "🙈" : "👁️"}
                                  </button>
                                </div>

                                <div className="keypad">
                                  {[
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7",
                                    "8",
                                    "9",
                                  ].map((num) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() =>
                                        handleKeypadPress(order.id, num)
                                      }
                                      className="keypad-btn"
                                    >
                                      {num}
                                    </button>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleKeypadClear(order.id)
                                    }
                                    className="keypad-btn clear"
                                  >
                                    C
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleKeypadPress(order.id, "0")
                                    }
                                    className="keypad-btn"
                                  >
                                    0
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleKeypadBackspace(order.id)
                                    }
                                    className="keypad-btn back"
                                  >
                                    ⌫
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleUnlockCabinet(order)}
                                  className="unlock-btn"
                                >
                                  Unlock Cabinet
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUnlockCabinet(order)}
                                className="unlock-btn"
                              >
                                Confirm Delivery
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {unlockMessage && (
                  <p
                    className={`order-message ${
                      unlockMessage.includes("✅") ? "success" : "error"
                    }`}
                  >
                    {unlockMessage}
                  </p>
                )}
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon">🧴</div>
                  <h4 className="info-title">Hotel Items</h4>
                  <p className="info-text">
                    Staff can select hotel supplies such as towels, water,
                    slippers, shampoo and other room-service items.
                  </p>
                </div>

                <div className="info-card">
                  <div className="info-icon">🔐</div>
                  <h4 className="info-title">Secure Cabinet</h4>
                  <p className="info-text">
                    The cabinet opens only after the customer enters the correct
                    password when the robot arrives.
                  </p>
                </div>

                <div className="info-card">
                  <div className="info-icon">🤖</div>
                  <h4 className="info-title">Robot Delivery</h4>
                  <p className="info-text">
                    Admin confirms orders first, then the robot visits rooms
                    using the optimized route.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </section>
      </div>

      <Footer />
    </>
  );
}