import React, { Component } from "react";

import { CircularProgress } from "@material-ui/core";
import { Typography } from "@material-ui/core";

import axios from "axios";

import "./index.css";

export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, isLoaded: false };
  }

  componentDidMount() {
    let req_path = `/api/v1/planners/get/${this.props.match.params.oid}`;
    let req_args = "";

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data.content;
        this.setState({
          data: data,
          isLoaded: true,
        });
      })
      .catch((error) => {
        console.error(error);
        if (error.response) {
          window.alert(error.response.message || "Error!");
        } else {
          window.alert("Error!");
        }
      });
  }

  render() {
    let { data, isLoaded } = this.state;
    return isLoaded ? (
      <div className="page__container">
        <Typography variant="h1">plannitt</Typography>
        {data.mode == "calendar" ? (
          <div className="planner__calendar"></div>
        ) : (
          <div className="planner__timetable"></div>
        )}
      </div>
    ) : (
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
