import React, { Component } from "react";

import { CircularProgress, Typography } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import { Calendar } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import axios from "axios";

import { Header, theme } from "../../components";
import "./index.css";

export class User {
  constructor(data, update) {
    this._id = data._id;
    this.data = data;
    this.name = data.name;
    this.times = [];
    this.init();
    this.update = update;
  }

  init() {
    for (let i = 0; i < this.data.times.length; i++) {
      let time = new Time(this.data.times[i]);
      this.times.push(time);
    }
    this.sort();
  }

  sort() {
    const len = this.times.length;
    for (let i = 0; i < len - 1; i++) {
      for (let j = 0; j < len - i - 1; j++) {
        if (this.times[j].start > this.times[j + 1].start) {
          let swap = this.times[j];
          this.times[j] = this.times[j + 1];
          this.times[j + 1] = swap;
        }
      }
    }
  }

  pushTime(start, end) {
    this.times.push(new Time({ start: start, end: end }));
    this.sort();
    this.update();
  }

  pullTime(n) {
    this.times.splice(n, 1);
    this.update();
  }
}

export class Time {
  constructor(data) {
    this.data = data;
    this.end = data.end;
    this.start = data.start;
  }

  pushEnd(end) {
    this.end = end;
  }

  pushStart(start) {
    this.start = start;
  }
}

export default class UserPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      days: [],
      isLoaded: false,
      mode: null,
      name: this.props.match.params.user,
      oid: this.props.match.params.oid,
      password: (
        JSON.parse(window.localStorage.getItem("recent_planners") || "{}")[
          this.props.match.params.oid
        ] || {}
      ).password,
      update: false,
      user: null,
    };

    this.update = this.update.bind(this);
    this.onDaysChange = this.onDaysChange.bind(this);
  }

  componentDidMount() {
    let { name, oid, password } = this.state;

    let req_path = `/api/v1/planner/get/${oid}/${name}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data.content;
        let mode = response.data.mode;
        let user = new User(data, this.update);
        this.setState({ data: data, isLoaded: true, mode: mode, user: user });
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

  update() {
    this.setState({ update: !update });
  }

  onDaysChange(evt) {
    this.setState({ days: evt });
  }

  render() {
    let { days, isLoaded, mode, user } = this.state;

    return isLoaded && mode == "calendar" ? (
      <div className="page__container">
        <Header
          goBack={this.props.history.goBack}
          goForward={this.props.history.goForward}
        />
        <div>
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
              width: "100%",
              margin: "15px 0 20px 0",
            }}
          >
            {user.name}
          </Typography>
          <Calendar
            value={days}
            onChange={this.onDaysChange}
            colorPrimary={theme.palette.primary.main}
            slideAnimationDuration="0.2s"
          />
          <MuiAlert
            elevation={6}
            variant="filled"
            severity="info"
            style={{ marginTop: "30px" }}
          >
            Select the dates when you are available.
          </MuiAlert>
        </div>
      </div>
    ) : isLoaded ? (
      <div className="page__container">
        <Header
          goBack={this.props.history.goBack}
          goForward={this.props.history.goForward}
        />
      </div>
    ) : (
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
