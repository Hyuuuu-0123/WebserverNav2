import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "./header";
import Footer from "./footer";
import Sidebaruser from "./Sidebaruser";

import "../style/History.css";

export default function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000/api/history";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.get(API_URL);

      if (Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (Array.isArray(res.data.history)) {
        setHistory(res.data.history);
      } else if (Array.isArray(res.data.data)) {
        setHistory(res.data.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      setMessage("Failed to load order history. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    let data = [...history];

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();

      data = data.filter((item) => {
        return (
          String(item.id || "").toLowerCase().includes(keyword) ||
          String(item.sender_room || "").toLowerCase().includes(keyword) ||
          String(item.receiver_room || "").toLowerCase().includes(keyword) ||
          String(item.target_room || "").toLowerCase().includes(keyword) ||
          String(item.receiver_name || "").toLowerCase().includes(keyword) ||
          String(item.customer_name || "").toLowerCase().includes(keyword) ||
          String(item.item_name || "").toLowerCase().includes(keyword) ||
          String(item.order_name || "").toLowerCase().includes(keyword) ||
          String(item.cabinet_number || "").toLowerCase().includes(keyword)
        );
      });
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (item) =>
          String(item.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    return data;
  }, [history, search, statusFilter]);

  const formatDateTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "done" || s === "completed" || s === "success") {
      return "history-badge success";
    }

    if (s === "submitted") {
      return "history-badge running";
    }

    if (s === "running" || s === "processing" || s === "delivering") {
      return "history-badge running";
    }

    if (s === "arrived") {
      return "history-badge arrived";
    }

    if (s === "failed" || s === "cancelled") {
      return "history-badge failed";
    }

    return "history-badge pending";
  };

  return (
    <>
      <Header />

      <div className="history-page">
        <Sidebaruser />

        <section className="history-main-panel">
          <div className="history-topbar">
            <div>
              <h2 className="history-top-title">Order History</h2>
              <p className="history-top-sub">
                View completed, running, and cancelled robot delivery orders
              </p>
            </div>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
              className="history-refresh-btn"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <main className="history-content">
            <section className="history-card">
              <div className="history-card-header">
                <div>
                  <h1 className="history-title">ORDER HISTORY</h1>
                  <p className="history-subtitle">
                    View robot delivery order history
                  </p>
                </div>

                <div className="history-header-actions">
                  <button
                    type="button"
                    onClick={() => navigate("/order")}
                    className="history-back-btn"
                  >
                    Back to Order
                  </button>
                </div>
              </div>

              <div className="history-filter-row">
                <input
                  type="text"
                  className="history-search-input"
                  placeholder="Search by ID, room, customer, item, cabinet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="history-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="running">Running</option>
                  <option value="delivering">Delivering</option>
                  <option value="arrived">Arrived</option>
                  <option value="done">Done</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {message && <p className="history-message error">{message}</p>}

              <div className="history-summary-grid">
                <div className="history-summary-card">
                  <span className="history-summary-label">Total Orders</span>
                  <strong>{history.length}</strong>
                </div>

                <div className="history-summary-card">
                  <span className="history-summary-label">Showing</span>
                  <strong>{filteredHistory.length}</strong>
                </div>

                <div className="history-summary-card">
                  <span className="history-summary-label">Current Filter</span>
                  <strong>{statusFilter.toUpperCase()}</strong>
                </div>
              </div>

              <div className="history-table-card">
                {loading ? (
                  <div className="history-empty">Loading order history...</div>
                ) : filteredHistory.length === 0 ? (
                  <div className="history-empty">No order history found.</div>
                ) : (
                  <div className="history-table-wrap">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Sender Room</th>
                          <th>Receiver Room</th>
                          <th>Customer</th>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Cabinet</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Completed At</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredHistory.map((item, index) => (
                          <tr key={item.id || index}>
                            <td>{item.id || index + 1}</td>

                            <td>{item.sender_room || item.room || "N/A"}</td>

                            <td>
                              {item.receiver_room || item.target_room || "N/A"}
                            </td>

                            <td>
                              {item.receiver_name ||
                                item.customer_name ||
                                item.name ||
                                "N/A"}
                            </td>

                            <td>{item.item_name || "N/A"}</td>

                            <td>{item.quantity || "N/A"}</td>

                            <td>
                              {item.cabinet_number
                                ? `Cabinet ${item.cabinet_number}`
                                : "N/A"}
                            </td>

                            <td>
                              <span className={getStatusClass(item.status)}>
                                {item.status || "pending"}
                              </span>
                            </td>

                            <td>
                              {formatDateTime(
                                item.created_at || item.createdAt
                              )}
                            </td>

                            <td>
                              {formatDateTime(
                                item.completed_at ||
                                  item.completedAt ||
                                  item.finished_at ||
                                  item.updated_at
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </main>
        </section>
      </div>

      <Footer />
    </>
  );
}