import React, { Component } from "react";
import * as ROSLIB from "roslib";
import { Alert } from "react-bootstrap";
import Config from"../script/config";

class Connection extends Component {
  state = {
    connected: false,
    ros: null,
  };

  componentDidMount() {
    this.init_connection();
  }

  componentWillUnmount() {
    if (this.state.ros) {
      this.state.ros.close();
    }
  }

  init_connection = () => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("connection established!");
      this.setState({ connected: true });
    });

    ros.on("close", () => {
      console.log("connection closed!");
      this.setState({ connected: false });

      setTimeout(() => {
        try {
          ros.connect("ws://" + Config.ROSBRIDGE_IP_SERVER + ":" + Config.ROSBRIDGE_IP_PORT);
        } catch (error) {
          console.log("connection problem:", error);
        }
      }, Config.RECONNECTION_TIMER);
    });

    ros.on("error", (error) => {
      console.log("connection error:", error);
      this.setState({ connected: false });
    });

    try {
      ros.connect("ws://" + Config.ROSBRIDGE_IP_SERVER + ":" + Config.ROSBRIDGE_IP_PORT);
    } catch (error) {
      console.log("initial connection problem:", error);
    }

    this.setState({ ros: ros });
  };

  render() {
    return (
      <div>
        <Alert
          className="text-center mt-3"
          variant={this.state.connected ? "success" : "danger"}
        >
          {this.state.connected ? "ROBOT CONNECTED" : "ROBOT DISCONNECTED"}
        </Alert>
      </div>
    );
  }
}

export default Connection;