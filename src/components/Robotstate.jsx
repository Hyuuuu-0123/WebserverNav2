import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import Config from "../script/config";
import * as ROSLIB from "roslib";
import * as THREE from "three";

class Robotstate extends Component {
  state = {
    ros: null,
    connected: false,
    x: 0,
    y: 0,
    yaw: 0,
    linear_vel: 0,
    angular_vel: 0,
    goal_x: null,
    goal_y: null,
    feedback_status: "No goal",
  };

  constructor() {
    super();
    this.pose_subscriber = null;
    this.velocity_subscriber = null;
    this.goal_subscriber = null;
    this.nav2_status_subscriber = null;
  }

  componentDidMount() {
    this.init_connection();
  }

  componentWillUnmount() {
    if (this.pose_subscriber) this.pose_subscriber.unsubscribe();
    if (this.velocity_subscriber) this.velocity_subscriber.unsubscribe();
    if (this.goal_subscriber) this.goal_subscriber.unsubscribe();
    if (this.nav2_status_subscriber) this.nav2_status_subscriber.unsubscribe();
  }

  init_connection = () => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("connection established in Robotstate component!");

      this.setState({ ros: ros, connected: true }, () => {
        this.getRobotState();
      });
    });

    ros.on("close", () => {
      console.log("connection closed!");
      this.setState({ connected: false });
    });

    ros.on("error", (error) => {
      console.log("connection error:", error);
      this.setState({ connected: false });
    });

    ros.connect(
      "ws://" + Config.ROSBRIDGE_IP_SERVER + ":" + Config.ROSBRIDGE_IP_PORT
    );
  };

  getRobotState() {
    this.pose_subscriber = new ROSLIB.Topic({
      ros: this.state.ros,
      name: Config.AMCL_TOPIC,
      messageType: "geometry_msgs/msg/PoseWithCovarianceStamped",
    });

    this.pose_subscriber.subscribe((message) => {
      const x = message.pose.pose.position.x;
      const y = message.pose.pose.position.y;
      const yaw = this.getOrientationFromQuaternion(
        message.pose.pose.orientation
      );

      let status = this.state.feedback_status;

      if (this.state.goal_x !== null && this.state.goal_y !== null) {
        const dx = this.state.goal_x - x;
        const dy = this.state.goal_y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.25 && status !== "Abort / Failed") {
          status = "Reached";
        } else if (status !== "Abort / Failed" && status !== "Reached") {
          status = "Moving";
        }
      }

      this.setState({
        x: x.toFixed(2),
        y: y.toFixed(2),
        yaw: yaw.toFixed(2),
        feedback_status: status,
      });
    });

    this.velocity_subscriber = new ROSLIB.Topic({
      ros: this.state.ros,
      name: Config.ODOM_TOPIC,
      messageType: "nav_msgs/msg/Odometry",
    });

    let lastUpdate = 0;

    this.velocity_subscriber.subscribe((message) => {
      const now = Date.now();

      if (now - lastUpdate < 200) return;

      lastUpdate = now;

      let linear = message.twist.twist.linear.x;
      let angular = message.twist.twist.angular.z;

      if (Math.abs(linear) < 0.01) linear = 0;
      if (Math.abs(angular) < 0.01) angular = 0;

      this.setState({
        linear_vel: linear.toFixed(2),
        angular_vel: angular.toFixed(2),
      });
    });

    this.goal_subscriber = new ROSLIB.Topic({
      ros: this.state.ros,
      name: "/goal_pose",
      messageType: "geometry_msgs/msg/PoseStamped",
    });

    this.goal_subscriber.subscribe((message) => {
      this.setState({
        goal_x: message.pose.position.x,
        goal_y: message.pose.position.y,
        feedback_status: "Goal received",
      });
    });

    this.nav2_status_subscriber = new ROSLIB.Topic({
      ros: this.state.ros,
      name: "/navigate_to_pose/_action/status",
      messageType: "action_msgs/msg/GoalStatusArray",
    });

    this.nav2_status_subscriber.subscribe((message) => {
      if (!message.status_list || message.status_list.length === 0) return;

      const latest = message.status_list[message.status_list.length - 1];
      const statusCode = latest.status;

      let statusText = this.state.feedback_status;

      if (statusCode === 2) {
        statusText = "Moving";
      } else if (statusCode === 4) {
        statusText = "Reached";
      } else if (statusCode === 5) {
        statusText = "Canceled";
      } else if (statusCode === 6) {
        statusText = "Abort / Failed";
      }

      this.setState({
        feedback_status: statusText,
      });
    });
  }

  getOrientationFromQuaternion(ros_orientation_quaternion) {
    const q = new THREE.Quaternion(
      ros_orientation_quaternion.x,
      ros_orientation_quaternion.y,
      ros_orientation_quaternion.z,
      ros_orientation_quaternion.w
    );

    const rpy = new THREE.Euler().setFromQuaternion(q);

    return rpy.z * (180 / Math.PI);
  }

  getStatusColor() {
    if (this.state.feedback_status === "Reached") return "#16a34a";
    if (this.state.feedback_status === "Moving") return "#2563eb";
    if (this.state.feedback_status === "Abort / Failed") return "#dc2626";
    if (this.state.feedback_status === "Canceled") return "#ea580c";
    if (this.state.feedback_status === "Goal received") return "#9333ea";
    return "#64748b";
  }

  render() {
  return (
    <div style={{ fontSize: "18px" }}>
      <Row>
        <Col md={6}>
          <h4
            className="mt-4"
            style={{ fontSize: "24px", fontWeight: "800" }}
          >
            Position
          </h4>

          <p className="mt-0" style={{ fontSize: "16.5px", fontWeight: "600" }}>
            x: {this.state.x} m
          </p>

          <p className="mt-0" style={{ fontSize: "16.5px", fontWeight: "600" }}>
            y: {this.state.y} m
          </p>

          <p className="mt-0" style={{ fontSize: "16.5px", fontWeight: "600" }}>
            yaw: {this.state.yaw} degree
          </p>
        </Col>

        <Col md={6}>
          <h4
            className="mt-4"
            style={{ fontSize: "24px", fontWeight: "800" }}
          >
            Velocities
          </h4>

          <p
            className="mt-0"
            style={{
              fontSize: "16.5px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            linear_vel: {this.state.linear_vel} m/s
          </p>

          <p
            className="mt-0"
            style={{
              fontSize: "16.5px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            angular_vel: {this.state.angular_vel} rad/s
          </p>
        </Col>
      </Row>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          whiteSpace: "nowrap",
          fontSize: "20px",
        }}
      >
        <span style={{ fontWeight: "800", color: "#0f172a" }}>
          Feedback Status:
        </span>

        <span
          style={{
            fontWeight: "900",
            color: this.getStatusColor(),
          }}
        >
          {this.state.feedback_status}
        </span>
      </div>
    </div>
  );
  }
}

export default Robotstate;