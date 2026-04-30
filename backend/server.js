const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

// ================= MYSQL CONNECTION =================
const db = mysql.createConnection({
  host: "localhost",
  user: "robot_user",
  password: "123456",
  database: "robot_db",
});

db.connect((err) => {
  if (err) {
    console.log("MySQL connection failed:", err);
    return;
  }

  console.log("Connected to MySQL");
});

// ================= ROSBRIDGE CONNECTION =================
let rosbridge = null;

function connectRosbridge() {
  rosbridge = new WebSocket("ws://localhost:9090");

  rosbridge.on("open", () => {
    console.log("Connected to ROSBridge");

    rosbridge.send(
      JSON.stringify({
        op: "advertise",
        topic: "/web_data",
        type: "std_msgs/String",
      })
    );

    rosbridge.send(
      JSON.stringify({
        op: "advertise",
        topic: "/web_dispatch",
        type: "std_msgs/String",
      })
    );
  });

  rosbridge.on("error", (err) => {
    console.log("ROSBridge error:", err.message);
  });

  rosbridge.on("close", () => {
    console.log("ROSBridge closed. Reconnecting...");
    setTimeout(connectRosbridge, 2000);
  });
}

connectRosbridge();

function publishRos(topic, data) {
  if (!rosbridge || rosbridge.readyState !== WebSocket.OPEN) {
    console.log("ROSBridge is not connected");
    return;
  }

  rosbridge.send(
    JSON.stringify({
      op: "publish",
      topic,
      msg: {
        data: JSON.stringify(data),
      },
    })
  );

  console.log(`Published to ${topic}:`, data);
}

// ================= TEST BACKEND =================
app.get("/", (req, res) => {
  res.send("Robot backend is running");
});

// ================= REGISTER =================
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.query(sql, [username, password], (err) => {
    if (err) {
      console.log("Register failed:", err);

      return res.status(500).json({
        success: false,
        message: "Register failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Register success",
    });
  });
});

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.log("Login failed:", err);

      return res.status(500).json({
        success: false,
        message: "Login failed",
        error: err,
      });
    }

    if (result.length > 0) {
      res.json({
        success: true,
        message: "Login success",
        user: result[0],
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Wrong username or password",
      });
    }
  });
});

// ================= CREATE ORDER ONLY - USER =================
// User chỉ tạo đơn pending.
// Không gửi ROS ở đây.
// Password được phép để trống.
app.post("/api/orders", (req, res) => {
  const {
    sender_room,
    receiver_name,
    receiver_room,
    item_name,
    quantity,
    cabinet_number,
    password,
    note,
  } = req.body;

  const safeQuantity = Number(quantity);
  const safePassword = password || "";

  if (
    !sender_room ||
    !receiver_name ||
    !receiver_room ||
    !item_name ||
    !safeQuantity ||
    safeQuantity <= 0 ||
    !cabinet_number
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required order information. Sender room, customer information, receiver room, item, quantity and cabinet are required.",
    });
  }

  const sql = `
    INSERT INTO orders
    (
      sender_room,
      receiver_name,
      receiver_room,
      item_name,
      quantity,
      cabinet_number,
      password,
      note,
      status,
      created_at,
      show_in_history
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
  `;

  db.query(
    sql,
    [
      sender_room,
      receiver_name,
      receiver_room,
      item_name,
      safeQuantity,
      cabinet_number,
      safePassword,
      note || "",
      "pending",
      1,
    ],
    (err, result) => {
      if (err) {
        console.log("Create order failed:", err);

        return res.status(500).json({
          success: false,
          message: "Create order failed",
          error: err,
        });
      }

      res.json({
        success: true,
        message: "Order created. Waiting for admin confirmation.",
        order_id: result.insertId,
      });
    }
  );
});

// ================= GET ORDERS - USER =================
app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE show_in_history = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get orders failed:", err);

      return res.status(500).json({
        success: false,
        message: "Get orders failed",
        error: err,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
});

// ================= ADMIN GET ALL ORDERS =================
app.get("/api/admin/orders", (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE show_in_history = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Admin get orders failed:", err);

      return res.status(500).json({
        success: false,
        message: "Admin get orders failed",
        error: err,
      });
    }

    res.json(result);
  });
});

// ================= ADMIN SUBMIT SELECTED ORDERS TO ROBOT =================
// Admin chọn đơn pending rồi submit lên hệ thống robot.
// Trường hợp password NULL/rỗng vẫn submit bình thường.
app.post("/api/admin/orders/submit", (req, res) => {
  const { order_ids } = req.body;

  if (!Array.isArray(order_ids) || order_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one order",
    });
  }

  const getSql = `
    SELECT *
    FROM orders
    WHERE id IN (?) AND status = 'pending'
    ORDER BY created_at ASC
  `;

  db.query(getSql, [order_ids], (getErr, orders) => {
    if (getErr) {
      console.log("Get selected orders failed:", getErr);

      return res.status(500).json({
        success: false,
        message: "Get selected orders failed",
        error: getErr,
      });
    }

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending orders found",
      });
    }

    const selectedIds = orders.map((order) => order.id);

    const updateSql = `
      UPDATE orders
      SET status = 'submitted'
      WHERE id IN (?) AND status = 'pending'
    `;

    db.query(updateSql, [selectedIds], (updateErr) => {
      if (updateErr) {
        console.log("Submit orders failed:", updateErr);

        return res.status(500).json({
          success: false,
          message: "Submit orders failed",
          error: updateErr,
        });
      }

      const submittedOrders = orders.map((order) => ({
        ...order,
        order_id: order.id,
        password: order.password || "",
        status: "submitted",
      }));

      publishRos("/web_data", {
        command: "admin_submit_orders",
        orders: submittedOrders,
      });

      publishRos("/web_dispatch", {
        command: "start",
        order_ids: selectedIds,
        orders: submittedOrders,
        time: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: "Orders submitted to robot system",
        order_ids: selectedIds,
        orders: submittedOrders,
      });
    });
  });
});

// ================= ADMIN UPDATE ORDER STATUS =================
app.put("/api/admin/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = [
    "pending",
    "submitted",
    "running",
    "delivering",
    "arrived",
    "completed",
    "cancelled",
    "done",
  ];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  let sql = "";
  let values = [];

  if (status === "completed" || status === "done") {
    sql = `
      UPDATE orders
      SET status = ?, completed_at = NOW()
      WHERE id = ?
    `;
    values = [status, id];
  } else {
    sql = `
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `;
    values = [status, id];
  }

  db.query(sql, values, (err) => {
    if (err) {
      console.log("Admin update status failed:", err);

      return res.status(500).json({
        success: false,
        message: "Admin update status failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
    });
  });
});

// ================= ADMIN DELETE COMPLETED ORDERS =================
// Route này phải đặt trước /api/admin/orders/:id
app.delete("/api/admin/orders/completed", (req, res) => {
  const sql = `
    DELETE FROM orders
    WHERE status = 'completed' OR status = 'done'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Delete completed orders failed:", err);

      return res.status(500).json({
        success: false,
        message: "Delete completed orders failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Completed orders deleted",
      affectedRows: result.affectedRows,
    });
  });
});

// ================= ADMIN DELETE ONE ORDER =================
app.delete("/api/admin/orders/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM orders WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Admin delete order failed:", err);

      return res.status(500).json({
        success: false,
        message: "Admin delete order failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Order deleted",
      affectedRows: result.affectedRows,
    });
  });
});

// ================= DISPATCH COMMAND =================
// Chỉ dispatch các đơn đã được admin submit.
app.post("/api/dispatch", (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE status = 'submitted'
    ORDER BY created_at ASC
  `;

  db.query(sql, (err, orders) => {
    if (err) {
      console.log("Dispatch failed:", err);

      return res.status(500).json({
        success: false,
        message: "Dispatch failed",
        error: err,
      });
    }

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No submitted orders to dispatch",
      });
    }

    const submittedOrders = orders.map((order) => ({
      ...order,
      order_id: order.id,
      password: order.password || "",
    }));

    publishRos("/web_dispatch", {
      command: "start",
      orders: submittedOrders,
      time: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Dispatch command sent to ROS2",
      orders: submittedOrders,
    });
  });
});

// ================= ROBOT GET SUBMITTED ORDERS =================
app.get("/api/robot/orders", (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE status = 'submitted'
    ORDER BY created_at ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Robot get submitted orders failed:", err);

      return res.status(500).json({
        success: false,
        message: "Robot get submitted orders failed",
        error: err,
      });
    }

    const orders = result.map((order) => ({
      ...order,
      order_id: order.id,
      password: order.password || "",
    }));

    res.json({
      success: true,
      data: orders,
    });
  });
});

// ================= ROBOT SET ORDER DELIVERING =================
app.put("/api/robot/orders/:id/delivering", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE orders
    SET status = 'delivering'
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.log("Update delivering failed:", err);

      return res.status(500).json({
        success: false,
        message: "Update delivering failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Order is now delivering",
    });
  });
});

// ================= ROBOT SET ORDER COMPLETED =================
app.put("/api/robot/orders/:id/completed", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE orders
    SET status = 'completed', completed_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.log("Update completed failed:", err);

      return res.status(500).json({
        success: false,
        message: "Update completed failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Order completed",
    });
  });
});

// ================= ROBOT ARRIVED CALLBACK =================
app.post("/api/robot/arrived", (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "order_id is required",
    });
  }

  const sql = `
    UPDATE orders
    SET status = 'arrived'
    WHERE id = ?
  `;

  db.query(sql, [order_id], (err) => {
    if (err) {
      console.log("Update arrived status failed:", err);

      return res.status(500).json({
        success: false,
        message: "Update arrived status failed",
        error: err,
      });
    }

    publishRos("/web_data", {
      command: "robot_arrived",
      order_id,
      status: "arrived",
    });

    res.json({
      success: true,
      message: "Robot arrived. Password input is now available.",
    });
  });
});

// ================= UNLOCK CABINET + CONTINUE ROBOT =================
// Nếu order không có password, user bấm Confirm Delivery là hoàn thành luôn.
app.post("/api/orders/:id/unlock", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const sql = "SELECT * FROM orders WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Check password failed:", err);

      return res.status(500).json({
        success: false,
        message: "Check password failed",
        error: err,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = result[0];
    const savedPassword = order.password || "";
    const inputPassword = password || "";

    if (savedPassword !== "" && inputPassword !== savedPassword) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    const updateSql = `
      UPDATE orders
      SET status = 'completed', completed_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [id], (updateErr) => {
      if (updateErr) {
        console.log("Unlock failed:", updateErr);

        return res.status(500).json({
          success: false,
          message: "Unlock failed",
          error: updateErr,
        });
      }

      publishRos("/web_data", {
        command: "unlock_cabinet",
        order_id: id,
        cabinet_number: order.cabinet_number,
        item_name: order.item_name,
        quantity: order.quantity,
        status: "completed",
      });

      publishRos("/web_dispatch", {
        command: "continue",
        order_id: id,
        cabinet_number: order.cabinet_number,
        item_name: order.item_name,
        quantity: order.quantity,
        next_action: "go_next_room",
      });

      res.json({
        success: true,
        message:
          "Cabinet unlocked successfully. Order completed. Robot can continue.",
      });
    });
  });
});

// ================= GET HISTORY =================
app.get("/api/history", (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE show_in_history = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Get history failed:", err);

      return res.status(500).json({
        success: false,
        message: "Get history failed",
        error: err,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
});

// ================= DELETE ORDER - USER/HISTORY =================
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM orders WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Delete order failed:", err);

      return res.status(500).json({
        success: false,
        message: "Delete order failed",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Order deleted",
      affectedRows: result.affectedRows,
    });
  });
});

// ================= START SERVER =================
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});