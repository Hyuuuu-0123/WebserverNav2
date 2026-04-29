import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import { Ros, Topic } from "roslib";
import Config from "../script/config";

class Teleoperation extends Component {
  state = {
    ros: null,
    connected: false,
  };

  constructor() {
    super();
    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  componentDidMount() {
    this.init_connection();
  }

  init_connection = () => {
    const ros = new Ros();

    ros.on("connection", () => {
      console.log("connection established in Teleoperation component!");
      this.setState({ connected: true });
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

    this.setState({ ros: ros });
  };

  handleMove(event) {
    if (!this.state.ros || !this.state.connected) {
      console.log("ROS not connected yet");
      return;
    }

    const cmd_vel = new Topic({
      ros: this.state.ros,
      name: Config.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/msg/Twist",
    });

    const twist = {
      linear: {
        x: event.y/2 ,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: -event.x/2 ,
      },
    };

    cmd_vel.publish(twist);
  }

  handleStop() {
    if (!this.state.ros || !this.state.connected) {
      console.log("ROS not connected yet");
      return;
    }

    const cmd_vel = new Topic({
      ros: this.state.ros,
      name: Config.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/msg/Twist",
    });

    const twist = {
      linear: {
        x: 0,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    };

    cmd_vel.publish(twist);
  }

  render() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "20px 0",
      }}
    >
      <Joystick
        size={150}
        baseColor="#EEEEEE"
        stickColor="#BBBBBB"
        move={this.handleMove}
        stop={this.handleStop}
      />
    </div>
  );}
}

export default Teleoperation;