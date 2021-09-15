import React, { Component } from "react";

import { Button, CircularProgress, Typography } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import BackupIcon from "@material-ui/icons/Backup";

import { Calendar, utils } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import axios from "axios";

import { Header, theme } from "../../components";
import "./index.css";

export class User {
  constructor(data, mode, update) {
    this._id = data._id;
    this.data = data;
    this.mode = mode;
    this.name = data.name;
    this.times = this.data.times;
    this.update = update;
    this.init();
  }

  init() {
    this.sort();
    this.update();
  }

  sort() {
    const len = this.times.length;
    if (this.mode == "calendar") {
      for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len - 1; j++) {
          if (utils().isBeforeDate(this.times[j + 1], this.times[j])) {
            let swap = this.times[j];
            this.times[j] = this.times[j + 1];
            this.times[j + 1] = swap;
          }
        }
      }
    } else {
      for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len - 1; j++) {
          if (this.times[j] > this.times[j + 1]) {
            let swap = this.times[j];
            this.times[j] = this.times[j + 1];
            this.times[j + 1] = swap;
          }
        }
      }
    }
  }

  postTime(data) {
    if (this.mode == "calendar") {
      this.times = data;
    } else {
      this.times.push(data);
    }
    this.sort();
    this.update();
  }

  pullTime(n) {
    if (this.mode == "calenar") {
    } else {
      this.times.splice(n, 1);
      this.update();
    }
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
    this.onSubmit = this.onSubmit.bind(this);
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
        let user = new User(data, mode, this.update);
        this.setState({
          data: data,
          days: user.times,
          isLoaded: true,
          mode: mode,
          user: user,
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

  update() {
    this.setState({ update: !this.state.update });
  }

  onDaysChange(evt) {
    this.setState({ days: evt });
  }

  onSubmit() {
    let { days, name, oid, password } = this.state;

    this.state.user.postTime(days);

    let req_path = `/api/v1/planner/post/${oid}/${name}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .post(req_path + req_args, this.state.user.times)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          this.setState({ data: data.content });
        } else {
          window.alert(data.message || "Error!");
        }
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
    let { days, isLoaded, mode, user } = this.state;

    return isLoaded && mode == "calendar" ? (
      <div className="page__container">
        <Header
          goBack={this.props.history.goBack}
          goForward={this.props.history.goForward}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
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
          <Button
            variant="contained"
            color="primary"
            onClick={this.onSubmit}
            startIcon={<BackupIcon />}
            style={{
              width: "150px",
              height: "50px",
              alignSelf: "center",
              marginTop: "25px",
            }}
          >
            Submit
          </Button>
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
