import React, { Component } from "react";

import { Button, CircularProgress, Typography } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import BackupIcon from "@material-ui/icons/Backup";

import { Calendar, utils } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import axios from "axios";

import { Header, theme, Timetable } from "../../components";
import "./index.css";

export class CalendarUser {
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
    var swapped = true;
    for (let i = 0; i < len - 1; i++) {
      if (!swapped) {
        break;
      }
      swapped = false;
      for (let j = 0; j < len - 1; j++) {
        if (utils().isBeforeDate(this.times[j + 1], this.times[j])) {
          let swap = this.times[j];
          this.times[j] = this.times[j + 1];
          this.times[j + 1] = swap;
          swapped = true;
        }
      }
    }
  }

  postTime(data) {
    this.times = data;
    this.sort();
    this.update();
  }
}

export class TimetableUser {
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

  add(value) {
    this.times.push({
      day: value.day,
      hour: value.hour,
      time: value.time,
      unix_time: value.unix_time,
    });
    this.update();
  }

  remove(unix_time) {
    for (let i = 0; i < this.times.length; i++) {
      if (this.times[i].unix_time == unix_time) {
        this.times.splice(i, 1);
        this.update();
        return true;
      }
    }
    return false;
  }

  find(unix_time) {
    for (let i = 0; i < this.times.length; i++) {
      if (this.times[i].unix_time == unix_time) {
        return this.times[i];
      }
    }
    return false;
  }

  sort() {
    const len = this.times.length;
    var swapped = true;
    for (let i = 0; i < len - 1; i++) {
      if (!swapped) {
        break;
      }
      swapped = false;
      for (let j = 0; j < len - 1; j++) {
        if (this.times[j + 1].unix_time < this.times[j].unix_time) {
          let swap = this.times[j];
          this.times[j] = this.times[j + 1];
          this.times[j + 1] = swap;
          swapped = true;
        }
      }
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
    this.onSubmitCalendar = this.onSubmitCalendar.bind(this);
    this.onSubmitTimetable = this.onSubmitTimetable.bind(this);
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
        if (mode == "calendar") {
          var user = new CalendarUser(data, mode, this.update);
        } else {
          var user = new TimetableUser(data, mode, this.update);
        }
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
          window.alert(error.response.data.message || "Error!");
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

  onSubmitCalendar() {
    let { days, name, oid, password } = this.state;

    this.state.user.postTime(days);

    let req_path = `/api/v1/planner/post/${oid}/${name}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .post(req_path + req_args, this.state.user.times)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          alert("Data submitted successfully.");
          this.setState({ data: data.content });
        } else {
          window.alert(data.message || "Error!");
        }
      })
      .catch((error) => {
        console.error(error);
        if (error.response) {
          window.alert(error.response.data.message || "Error!");
        } else {
          window.alert("Error!");
        }
      });
  }

  onSubmitTimetable() {
    let { name, oid, password } = this.state;

    this.state.user.sort();

    let req_path = `/api/v1/planner/post/${oid}/${name}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .post(req_path + req_args, this.state.user.times)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          alert("Data submitted successfully.");
          this.setState({ data: data.content });
        } else {
          window.alert(data.message || "Error!");
        }
      })
      .catch((error) => {
        console.error(error);
        if (error.response) {
          window.alert(error.response.data.message || "Error!");
        } else {
          window.alert("Error!");
        }
      });
  }

  render() {
    let { days, isLoaded, mode, user } = this.state;

    return isLoaded && mode == "calendar" ? (
      <div className="page__container">
        <Header goBack={this.props.history.goBack} />
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
            onClick={this.onSubmitCalendar}
            startIcon={<BackupIcon />}
            style={{
              width: "150px",
              height: "50px",
              alignSelf: "center",
              margin: "25px",
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    ) : isLoaded ? (
      <div className="page__container">
        <Header goBack={this.props.history.goBack} />
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
          <div className="timetable">
            <Timetable user={user} />
          </div>
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
            onClick={this.onSubmitTimetable}
            startIcon={<BackupIcon />}
            style={{
              width: "150px",
              height: "50px",
              alignSelf: "center",
              margin: "25px",
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    ) : (
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
