import React, { Component } from "react";
import Config from "../script/config";

class Map extends Component {
  constructor() {
    super();

    this.state = {
      ros: null,
      connected: false,
      mapLoaded: false,
    };

    this.viewer = null;
    this.gridClient = null;

    this.robotMarker = null;
    this.goalMarker = null;

    this.initialPoseTopic = null;
    this.amclTopic = null;
    this.planTopic = null;
    this.goalPoseTopic = null;

    this.planShape = null;
    this.planPoints = [];

    this.lastRobotX = null;
    this.lastRobotY = null;
    this.robotMoving = false;
    this.robotPulseInterval = null;

    this.reconnectTimer = null;

    this.view_map = this.view_map.bind(this);
  }

  componentDidMount() {
    this.init_connection();
  }

  componentWillUnmount() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.unsubscribeTopics();

    if (this.gridClient) {
      this.gridClient.removeAllListeners();
    }

    if (this.robotPulseInterval) {
      clearInterval(this.robotPulseInterval);
    }

    if (this.state.ros) {
      this.state.ros.close();
    }
  }

  unsubscribeTopics = () => {
    if (this.initialPoseTopic) this.initialPoseTopic.unsubscribe();
    if (this.amclTopic) this.amclTopic.unsubscribe();
    if (this.planTopic) this.planTopic.unsubscribe();

    this.initialPoseTopic = null;
    this.amclTopic = null;
    this.planTopic = null;
    this.goalPoseTopic = null;
  };

  init_connection = () => {
    const ros = new window.ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to rosbridge");

      this.setState({ ros: ros, connected: true, mapLoaded: false }, () => {
        this.view_map();
      });
    });

    ros.on("error", (error) => {
      console.log("Connection error:", error);
      this.setState({ connected: false });
    });

    ros.on("close", () => {
      console.log("Connection closed");

      this.setState({
        connected: false,
        mapLoaded: false,
      });

      this.unsubscribeTopics();

      this.reconnectTimer = setTimeout(() => {
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

    try {
      ros.connect(
        "ws://" + Config.ROSBRIDGE_IP_SERVER + ":" + Config.ROSBRIDGE_IP_PORT
      );
    } catch (error) {
      console.log("initial connection problem:", error);
    }

    this.setState({ ros: ros });
  };

  getYawFromQuaternion(q) {
    const siny_cosp = 2.0 * (q.w * q.z + q.x * q.y);
    const cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);
    return Math.atan2(siny_cosp, cosy_cosp);
  }

  createQuaternionFromYaw(yaw) {
    return {
      x: 0.0,
      y: 0.0,
      z: Math.sin(yaw / 2.0),
      w: Math.cos(yaw / 2.0),
    };
  }

  startRobotAnimation() {
    if (this.robotPulseInterval) return;

    let growing = true;

    this.robotPulseInterval = setInterval(() => {
      if (!this.robotMarker) return;

      if (this.robotMoving) {
        this.robotMarker.scaleX = growing ? 1.22 : 1.0;
        this.robotMarker.scaleY = growing ? 1.22 : 1.0;
        this.robotMarker.alpha = growing ? 0.75 : 1.0;
        growing = !growing;
      } else {
        this.robotMarker.scaleX = 1.0;
        this.robotMarker.scaleY = 1.0;
        this.robotMarker.alpha = 1.0;
      }
    }, 250);
  }

  createRobotMarker() {
    if (!this.viewer || !this.viewer.scene) return;

    this.robotMarker = new window.createjs.Shape();

    const g = this.robotMarker.graphics;
    g.clear();

    g.beginFill("#facc15");
    g.beginStroke("#111827");
    g.setStrokeStyle(0.08);

    g.moveTo(0.8, 0.0);
    g.lineTo(-0.55, -0.4);
    g.lineTo(-0.55, 0.4);
    g.closePath();

    g.endStroke();
    g.endFill();

    this.robotMarker.visible = false;
    this.viewer.scene.addChild(this.robotMarker);

    this.startRobotAnimation();
  }

  createGoalMarker() {
    if (!this.viewer || !this.viewer.scene) return;

    this.goalMarker = new window.createjs.Shape();

    const g = this.goalMarker.graphics;
    g.clear();

    g.beginFill("#ef4444");
    g.beginStroke("#7f1d1d");
    g.setStrokeStyle(0.04);

    g.drawCircle(0, 0, 0.1);

    g.endStroke();
    g.endFill();

    this.goalMarker.visible = false;
    this.viewer.scene.addChild(this.goalMarker);
  }

  updateGoalMarker(x, y) {
    if (!this.goalMarker) return;

    this.goalMarker.x = x;
    this.goalMarker.y = -y;
    this.goalMarker.visible = true;

    this.bringRobotToFront();
  }

  updateRobotMarker(x, y, yaw) {
    if (!this.robotMarker) return;

    if (this.lastRobotX !== null && this.lastRobotY !== null) {
      const dx = x - this.lastRobotX;
      const dy = y - this.lastRobotY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.robotMoving = dist > 0.01;
    }

    this.lastRobotX = x;
    this.lastRobotY = y;

    this.robotMarker.x = x;
    this.robotMarker.y = -y;
    this.robotMarker.rotation = -yaw * (180.0 / Math.PI);
    this.robotMarker.visible = true;

    this.bringRobotToFront();
  }

  startInitialPoseTopic() {
    this.initialPoseTopic = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: "/initialpose",
      messageType: "geometry_msgs/msg/PoseWithCovarianceStamped",
    });

    this.initialPoseTopic.subscribe((msg) => {
      const pos = msg.pose.pose.position;
      const q = msg.pose.pose.orientation;
      const yaw = this.getYawFromQuaternion(q);

      this.updateRobotMarker(pos.x, pos.y, yaw);
      console.log("Initial pose received:", pos.x, pos.y, yaw);
    });
  }

  publishInitialPose(x = 0.0, y = 0.0, yaw = 0.0) {
    if (!this.initialPoseTopic) {
      console.log("Initial pose topic not ready");
      return;
    }

    const q = this.createQuaternionFromYaw(yaw);

    const msg = new window.ROSLIB.Message({
      header: {
        frame_id: "map",
        stamp: {
          sec: 0,
          nanosec: 0,
        },
      },
      pose: {
        pose: {
          position: {
            x: x,
            y: y,
            z: 0.0,
          },
          orientation: q,
        },
        covariance: [
          0.25, 0, 0, 0, 0, 0,
          0, 0.25, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0.06853891945200942,
        ],
      },
    });

    this.initialPoseTopic.publish(msg);
    this.updateRobotMarker(x, y, yaw);

    console.log("Set initial pose:", x, y, yaw);
  }

  startAmclSubscriber() {
    this.amclTopic = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: "/amcl_pose",
      messageType: "geometry_msgs/msg/PoseWithCovarianceStamped",
    });

    this.amclTopic.subscribe((msg) => {
      const pos = msg.pose.pose.position;
      const q = msg.pose.pose.orientation;
      const yaw = this.getYawFromQuaternion(q);

      this.updateRobotMarker(pos.x, pos.y, yaw);
    });
  }

  startPlanSubscriber() {
    if (!this.viewer || !this.viewer.scene) return;

    this.planShape = new window.createjs.Shape();
    this.viewer.scene.addChild(this.planShape);

    this.planTopic = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: "/plan",
      messageType: "nav_msgs/msg/Path",
    });

    this.planTopic.subscribe((msg) => {
      if (!msg.poses || msg.poses.length < 2) return;

      this.planPoints = msg.poses.map((poseStamped) => ({
        x: poseStamped.pose.position.x,
        y: -poseStamped.pose.position.y,
      }));

      this.drawPlanLine();
      console.log("Plan received:", this.planPoints.length);
    });
  }

  drawPlanLine() {
    if (!this.planShape || this.planPoints.length < 2) return;

    const g = this.planShape.graphics;
    g.clear();

    g.setStrokeStyle(0.1);
    g.beginStroke("#22c55e");

    this.planPoints.forEach((p, index) => {
      if (index === 0) {
        g.moveTo(p.x, p.y);
      } else {
        g.lineTo(p.x, p.y);
      }
    });

    g.endStroke();

    this.bringRobotToFront();
  }

  startGoalPublisher() {
    this.goalPoseTopic = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: "/goal_pose",
      messageType: "geometry_msgs/msg/PoseStamped",
    });
  }

  sendNav2Goal(x, y, yaw = 0.0) {
    if (!this.goalPoseTopic) {
      console.log("Goal topic not ready");
      return;
    }

    const q = this.createQuaternionFromYaw(yaw);

    const goalMsg = new window.ROSLIB.Message({
      header: {
        frame_id: "map",
        stamp: {
          sec: 0,
          nanosec: 0,
        },
      },
      pose: {
        position: {
          x: x,
          y: y,
          z: 0.0,
        },
        orientation: q,
      },
    });

    this.goalPoseTopic.publish(goalMsg);
    this.updateGoalMarker(x, y);

    console.log("Sent Nav2 goal:", x, y, yaw);
  }

  enableMapClick() {
    if (!this.viewer || !this.viewer.scene) return;

    this.viewer.scene.cursor = "crosshair";

    this.viewer.scene.removeAllEventListeners("click");

    this.viewer.scene.addEventListener("click", (event) => {
      if (!this.state.mapLoaded) {
        console.log("Map not loaded yet");
        return;
      }

      const scaleX = this.viewer.scene.scaleX;
      const scaleY = this.viewer.scene.scaleY;
      const sceneX = this.viewer.scene.x;
      const sceneY = this.viewer.scene.y;

      const rosX = (event.stageX - sceneX) / scaleX;
      const rosY = -((event.stageY - sceneY) / scaleY);

      if (event.nativeEvent && event.nativeEvent.shiftKey) {
        this.publishInitialPose(rosX, rosY, 0.0);
      } else {
        this.sendNav2Goal(rosX, rosY, 0.0);
      }
    });
  }

  bringRobotToFront() {
    if (!this.viewer || !this.viewer.scene) return;

    if (this.goalMarker) {
      this.viewer.scene.removeChild(this.goalMarker);
      this.viewer.scene.addChild(this.goalMarker);
    }

    if (this.robotMarker) {
      this.viewer.scene.removeChild(this.robotMarker);
      this.viewer.scene.addChild(this.robotMarker);
    }
  }

  view_map() {
    const mapDiv = document.getElementById("nav_div");

    if (!mapDiv) {
      console.log("nav_div not found");
      return;
    }

    mapDiv.innerHTML = "";

    this.viewer = new window.ROS2D.Viewer({
      divID: "nav_div",
      width: 720,
      height: 520,
    });

    this.gridClient = new window.ROS2D.OccupancyGridClient({
      ros: this.state.ros,
      rootObject: this.viewer.scene,
      topic: "/map",
      // continuous: true,
      // compression: "cbor",
    });

    this.createRobotMarker();
    this.createGoalMarker();

    this.startInitialPoseTopic();
    this.startAmclSubscriber();
    this.startPlanSubscriber();
    this.startGoalPublisher();
    this.enableMapClick();

    this.gridClient.on("change", () => {
      if (!this.gridClient || !this.gridClient.currentGrid) return;
      if (!this.viewer || !this.viewer.scene) return;

      const grid = this.gridClient.currentGrid;

      this.viewer.scaleToDimensions(grid.width, grid.height);

      if (grid.pose && grid.pose.position) {
        this.viewer.shift(grid.pose.position.x, grid.pose.position.y);
      } else {
        this.viewer.shift(0, 0);
      }

      if (this.planShape) {
        this.viewer.scene.addChild(this.planShape);
      }

      this.bringRobotToFront();

      this.setState({ mapLoaded: true });
      console.log("map loaded");
    });
  }

  render() {
    return (
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "18px",
          padding: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#0f172a",
              margin: 0,
            }}
          >
            Navigation Map
          </h3>

          <span
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "700",
              color: this.state.connected ? "#166534" : "#991b1b",
              background: this.state.connected ? "#dcfce7" : "#fee2e2",
              border: this.state.connected
                ? "1px solid #86efac"
                : "1px solid #fecaca",
            }}
          >
            {this.state.connected
              ? "ROS Connected"
              : "ROS Disconnected"}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            id="nav_div"
            style={{
              width: "720px",
              height: "520px",
              background: "#ffffff",
              borderRadius: "14px",
              overflow: "hidden",
              border: "2px solid #cbd5e1",
              cursor: "crosshair",
            }}
          ></div>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "14px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          {this.state.mapLoaded
            ? "Click: send goal | Shift + Click: set initial pose | Yellow animated triangle: robot | Green: plan | Red: goal"
            : this.state.connected
            ? "Waiting for map data..."
            : "Waiting for ROS connection..."}
        </div>
      </div>
    );
  }
}

export default Map;