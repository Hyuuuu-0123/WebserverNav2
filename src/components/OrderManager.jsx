import React, { useEffect, useState } from "react";
import axios from "axios";

import Sidebaradmin from "./Sidebaradmin";
import "../style/OrderManager.css";

const API_URL = "http://localhost:5000/api";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 1000);

    return () => clearInterval(interval);
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/orders`);

      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Get orders error:", err);
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id]
    );
  };

  const selectAllPending = () => {
    const pendingIds = orders
      .filter((order) => order.status === "pending")
      .map((order) => order.id);

    setSelectedOrders(pendingIds);
  };

  const clearSelected = () => {
    setSelectedOrders([]);
  };

  const submitOrdersToRobot = async () => {
    if (selectedOrders.length === 0) {
      showMessage("Please select at least one pending order");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/admin/orders/submit`, {
        order_ids: selectedOrders,
      });

      if (res.data.success) {
        showMessage("Orders submitted to robot system");
        setSelectedOrders([]);
        fetchOrders();
      } else {
        showMessage("Submit failed");
      }
    } catch (err) {
      console.error("Submit orders error:", err);
      showMessage("Submit failed. Please check server or order status.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${id}/status`, {
        status,
      });

      showMessage("Status updated");
      fetchOrders();
    } catch (err) {
      console.error("Update status error:", err);
      showMessage("Update status failed");
    }
  };

  const deleteOrder = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this order?");
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/admin/orders/${id}`);

      showMessage("Order deleted");
      setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
      fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
      showMessage("Delete failed");
    }
  };

  const deleteCompletedOrders = async () => {
    const ok = window.confirm("Delete all completed orders?");
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/admin/orders/completed`);

      showMessage("Completed orders deleted");
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      console.error("Delete completed error:", err);
      showMessage("Delete completed orders failed");
    }
  };

  const getStatusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "pending":
        return "status pending";
      case "submitted":
        return "status submitted";
      case "running":
      case "delivering":
        return "status delivering";
      case "arrived":
        return "status submitted";
      case "completed":
      case "done":
        return "status completed";
      case "cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  const getPasswordText = (password) => {
    if (password === null || password === undefined || String(password) === "") {
      return "No";
    }

    return "Yes";
  };

  return (
    <div className="order-manager-layout">
      <Sidebaradmin />

      <main className="order-manager-main">
        <div className="order-manager-page">
          <div className="order-manager-header">
            <div>
              <h1>Order Manager</h1>
              <p>Manage hotel room orders and submit tasks to robot system</p>
            </div>

            <div className="order-manager-actions">
              <button className="btn secondary" onClick={selectAllPending}>
                Select Pending
              </button>

              <button className="btn secondary" onClick={clearSelected}>
                Clear
              </button>

              <button className="btn primary" onClick={submitOrdersToRobot}>
                Submit To Robot
              </button>

              <button className="btn danger" onClick={deleteCompletedOrders}>
                Clear Completed
              </button>
            </div>
          </div>

          {message && <div className="manager-message">{message}</div>}

          <div className="order-summary">
            <div className="summary-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="summary-card">
              <span>Pending</span>
              <strong>
                {orders.filter((o) => o.status === "pending").length}
              </strong>
            </div>

            <div className="summary-card">
              <span>Selected</span>
              <strong>{selectedOrders.length}</strong>
            </div>

            <div className="summary-card">
              <span>Completed</span>
              <strong>
                {
                  orders.filter(
                    (o) => o.status === "completed" || o.status === "done"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="order-table-wrapper">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Cabinet</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Control</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="empty-order">
                      No orders available
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          disabled={order.status !== "pending"}
                          onChange={() => toggleSelectOrder(order.id)}
                        />
                      </td>

                      <td>#{order.id}</td>

                      <td>
                        <strong>{order.sender_room || "N/A"}</strong>
                      </td>

                      <td>
                        <strong>{order.receiver_room || "N/A"}</strong>
                      </td>

                      <td>{order.receiver_name || "N/A"}</td>

                      <td>{order.item_name || "N/A"}</td>

                      <td>{order.quantity || 1}</td>

                      <td>
                        {order.cabinet_number
                          ? `Cabinet ${order.cabinet_number}`
                          : "N/A"}
                      </td>

                      <td>
                        {getPasswordText(order.password) === "Yes" ? (
                          <span className="password-chip">Yes</span>
                        ) : (
                          <span className="no-password-chip">No</span>
                        )}
                      </td>

                      <td>
                        <span className={getStatusClass(order.status)}>
                          {order.status || "pending"}
                        </span>
                      </td>

                      <td>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "N/A"}
                      </td>

                      <td>
                        <div className="control-buttons">
                          <button
                            onClick={() =>
                              updateStatus(order.id, "delivering")
                            }
                            disabled={
                              order.status === "completed" ||
                              order.status === "done"
                            }
                          >
                            Delivering
                          </button>

                          <button
                            onClick={() => updateStatus(order.id, "completed")}
                            disabled={
                              order.status === "completed" ||
                              order.status === "done"
                            }
                          >
                            Done
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}