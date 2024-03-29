import React, { Component } from "react";

import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import FunctionsIcon from "@material-ui/icons/Functions";
import LinkTwoToneIcon from "@material-ui/icons/LinkTwoTone";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import { Calendar } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import axios from "axios";

import { Header, theme } from "../../components";

import "./index.css";
export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isCalculated: false,
      isLoaded: false,
      isLoggedIn: false,
      isValid: [false, false],
      mode: null,
      new_name: "",
      oid: this.props.match.params.oid,
      password: (
        JSON.parse(window.localStorage.getItem("recent_planners") || "{}")[
          this.props.match.params.oid
        ] || {}
      ).password,
    };
    this.confirmAlert = this.confirmAlert.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onCalculateTime = this.onCalculateTime.bind(this);
    this.onCopyLink = this.onCopyLink.bind(this);
    this.onExport = this.onExport.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.sortUsers = this.sortUsers.bind(this);
  }

  componentDidMount() {
    let { oid, password } = this.state;

    let req_path = `/api/v1/planner/get/${oid}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          let recent_planners = JSON.parse(
            window.localStorage.getItem("recent_planners") || "{}"
          );
          recent_planners[oid] = {
            _id: data.content._id,
            mode: data.content.mode,
            password: password,
            title: data.content.title,
          };
          window.localStorage.setItem(
            "recent_planners",
            JSON.stringify(recent_planners)
          );
          this.setState({
            data: data.content,
            isLoaded: true,
            isLoggedIn: true,
            mode: data.content.mode,
          });
          this.sortUsers();
        } else {
          window.alert(data.message || "Error!");
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status == 401) {
            this.setState({ isLoaded: true, isLoggedIn: false });
          } else if (error.response.status == 404) {
            console.error(error);
            let recent_planners = JSON.parse(
              window.localStorage.getItem("recent_planners") || "{}"
            );
            if (recent_planners[oid]) {
              delete recent_planners[oid];
              window.localStorage.setItem(
                "recent_planners",
                JSON.stringify(recent_planners)
              );
            }
            window.alert(error.response.data.message || "Error!");
            this.props.history.push("/");
          } else if (error.response.status == 400) {
            console.error(error);
            window.alert(error.response.data.message || "Error!");
            this.props.history.push("/");
          } else {
            console.error(error);
            window.alert(error.response.data.message || "Error!");
            this.props.history.push("/");
          }
        } else {
          console.error(error);
          window.alert("Error!");
          this.props.history.push("/");
        }
      });
  }

  confirmAlert(evt) {
    var confirmation = window.confirm(evt);
    return confirmation;
  }

  onAddUser() {
    let { new_name, oid, password } = this.state;

    var post_data = {
      name: new_name,
      times: [],
    };

    let req_path = `/api/v1/planner/post/${oid}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .post(req_path + req_args, post_data)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          this.setState({ data: data.content, new_name: "" });
          this.sortUsers();
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

  onCalculateTime() {
    let { data, mode } = this.state;

    const users_len = data.users.length;
    var most_compatible = [];
    var same_days = [];
    var highest = 0;
    if (mode == "calendar") {
      for (let i = 0; i < users_len; i++) {
        for (let time of data.users[i].times) {
          let time_str = `${time.month}-${time.day}-${time.year}`;
          if (time_str in same_days) {
            same_days[time_str]++;
            most_compatible.push(time);
          } else {
            same_days[time_str] = 1;
          }
          if (highest < same_days[time_str]) {
            most_compatible = [time];
            highest = same_days[time_str];
          }
        }
      }
    } else {
      for (let i = 0; i < users_len; i++) {
        for (let time of data.users[i].times) {
          let time_str = time.time;
          if (time_str in same_days) {
            same_days[time_str] ++;
            if (same_days[time_str] > highest) {
              highest = same_days[time_str];
              most_compatible = [time_str];
            } else if (same_days[time_str] == highest) {
              most_compatible.push(time_str);
            }
          } else {
            same_days[time_str] = 1;
          }
        }
      }
    }

    var alert_str = `Compatibility Score: ${highest}/${users_len}\n\n`;
    var days = [];
    if (mode == "calendar") {
      for (let i = 0; i < most_compatible.length; i++) {
        let time_str = `${most_compatible[i].month}-${most_compatible[i].day}-${most_compatible[i].year}`;
        let date = new Date(time_str);
        if (date > new Date()) {
          days.push(most_compatible[i]);
          alert_str +=
            date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) + "\n";
        }
      }
      this.setState({ days: days, isCalculated: true });
    } else {
      for (let i = 0; i < most_compatible.length; i++) {
        alert_str += most_compatible[i] + "\n";
      }
      this.setState({ isCalculated: true });
    }
    alert(alert_str);
  }

  onCopyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() =>
        window.alert("The URL was successfully copied to your clipboard.")
      );
  }

  onExport() {
    let { data, mode } = this.state;

    var csv;
    if (mode == "calendar") {
      csv = "Users,Dates\n";
      for (let i = 0; i < data.users.length; i++) {
        let line = "";
        for (let j = 0; j < data.users[i].times.length; j++) {
          let dateObj = new Date(
            `${data.users[i].times[j].month}-${data.users[i].times[j].day}-${data.users[i].times[j].year}`
          );
          let date = dateObj.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          if (line != "") {
            line += "\n" + date;
          } else {
            line += date;
          }
        }
        csv += data.users[i].name + ',"' + line + '"' + "\r\n";
      }
    } else {
      csv = "Users,Times\n";
      for (let i = 0; i < data.users.length; i++) {
        let line = "";
        for (let j = 0; j < data.users[i].times.length; j++) {
          let time = data.users[i].times[j].time;
          if (line != "") {
            line += "\n" + time;
          } else {
            line += time;
          }
        }
        csv += data.users[i].name + ',"' + line + '"' + "\r\n";
      }
    }
    var download = document.createElement("a");
    download.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    download.setAttribute("download", data.title);
    download.click();
    download.remove();
  }

  onDelete() {
    let { oid, password } = this.state;

    if (!this.confirmAlert("Are you sure you want to delete this planner?")) {
      return;
    }

    let req_path = `/api/v1/planner/pull/${oid}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let recent_planners = JSON.parse(
          window.localStorage.getItem("recent_planners") || "{}"
        );
        delete recent_planners[oid];
        window.localStorage.setItem(
          "recent_planners",
          JSON.stringify(recent_planners)
        );
        this.props.history.push("/");
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

  onDeleteUser(n) {
    let { data, oid, password } = this.state;
    const user = data.users[n].name;

    if (
      !this.confirmAlert(`Are you sure you want to delete the user '${user}'?`)
    ) {
      return;
    }

    let req_path = `/api/v1/planner/pull/${oid}/${user}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data.content;
        this.setState({ data: data });
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

  onLogin() {
    let { oid, password } = this.state;

    let req_path = `/api/v1/planner/get/${oid}`;
    let req_args = `?password=${encodeURIComponent(password || "")}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          let recent_planners = JSON.parse(
            window.localStorage.getItem("recent_planners") || "{}"
          );
          recent_planners[oid] = {
            _id: data.content._id,
            mode: data.content.mode,
            password: password,
            title: data.content.title,
          };
          window.localStorage.setItem(
            "recent_planners",
            JSON.stringify(recent_planners)
          );
          this.setState({
            data: data.content,
            isLoaded: true,
            isLoggedIn: true,
          });
        } else {
          window.alert(data.message || "Error!");
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status == 401) {
            this.setState({ isLoaded: true, isLoggedIn: false });
          } else {
            console.error(error);
            window.alert(error.response.data.message || "Error!");
          }
        } else {
          console.error(error);
          window.alert("Error!");
        }
      });
  }

  onNameChange(evt) {
    if (evt.target.value != this.state.new_name) {
      if (evt.target.value) {
        var isValid = this.state.isValid;
        if (this.state.data.users.some((i) => i.name == evt.target.value)) {
          isValid[0] = false;
        } else {
          isValid[0] = true;
        }
        this.setState({ new_name: evt.target.value, isValid: isValid });
      } else {
        var isValid = this.state.isValid;
        isValid[0] = false;
        this.setState({ new_name: "", isValid: isValid });
      }
    }
  }

  onPasswordChange(evt) {
    if (evt.target.value != this.state.password) {
      if (evt.target.value) {
        var isValid = this.state.isValid;
        isValid[1] = true;
        this.setState({ password: evt.target.value, isValid: isValid });
      } else {
        var isValid = this.state.isValid;
        isValid[1] = false;
        this.setState({ password: "", isValid: isValid });
      }
    }
  }

  sortUsers() {
    let { data } = this.state;

    const len = data.users.length;
    var swapped = true;
    for (let i = 0; i < len - 1; i++) {
      if (!swapped) {
        break;
      }
      swapped = false;
      for (let j = 0; j < len - i - 1; j++) {
        if (data.users[j].name > data.users[j + 1].name) {
          let swap = data.users[j];
          data.users[j] = data.users[j + 1];
          data.users[j + 1] = swap;
          swapped = true;
        }
      }
    }
    this.setState({ data: data });
  }

  render() {
    let {
      data,
      days,
      isCalculated,
      isLoaded,
      isLoggedIn,
      isValid,
      mode,
      new_name,
      password,
    } = this.state;

    return !isLoaded ? (
      <div className="Loading">
        <CircularProgress />
      </div>
    ) : isLoggedIn ? (
      <div className="page__container">
        <Header goBack={this.props.history.goBack} />
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #111",
            borderRadius: "10px",
            margin: "25px 0 25px 0",
            width: "330px",
            maxWidth: "90%",
          }}
        >
          <List style={{ width: "330px", maxWidth: "100%" }} dense={false}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="h5"
                    className="user_name"
                    style={{ textAlign: "center", width: "100%" }}
                  >
                    {data.title}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            {data.users.length
              ? data.users.map((user, n) => (
                  <ListItem key={`user-${n}`}>
                    <Link
                      to={`/planner/${data._id}/${user.name}`}
                      className="no_decoration_link"
                    >
                      <ListItemAvatar>
                        <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                    </Link>
                    <Link
                      to={`/planner/${data._id}/${user.name}`}
                      className="no_decoration_link"
                    >
                      <ListItemText
                        style={{ width: "10rem" }}
                        primary={
                          <Typography className="user_name">
                            {user.name}
                          </Typography>
                        }
                      />
                    </Link>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => this.onDeleteUser(n)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              : null}
            {data.users.length ? (
              <Divider style={{ marginTop: "10px" }} />
            ) : null}
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <TextField
                    label="Name"
                    value={new_name}
                    onChange={this.onNameChange}
                    style={{ marginRight: "5px" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <div></div>
                        </InputAdornment>
                      ),
                    }}
                  />
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  disabled={isValid[0] ? false : true}
                  edge="end"
                  onClick={this.onAddUser}
                >
                  <AddCircleIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </div>
        {isCalculated && mode == "calendar" ? (
          <div style={{ marginBottom: "25px" }}>
            <Calendar
              value={days}
              colorPrimary={theme.palette.primary.main}
              slide
              maximumDate={0}
            ></Calendar>
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "325px",
          }}
        >
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onDelete}
              style={{ width: "150px", maxWidth: "100%" }}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </div>
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onExport}
              style={{ width: "150px", maxWidth: "100%" }}
              startIcon={<GetAppIcon />}
            >
              Export
            </Button>
          </div>
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onCopyLink}
              style={{ width: "150px", maxWidth: "100%" }}
              startIcon={<LinkTwoToneIcon />}
            >
              Copy Link
            </Button>
          </div>
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onCalculateTime}
              style={{ width: "150px", maxWidth: "100%" }}
              startIcon={<FunctionsIcon />}
            >
              Calculate
            </Button>
          </div>
        </div>
      </div>
    ) : (
      <div className="page__container">
        <Header goBack={this.props.history.goBack} />
        <TextField
          label="Password"
          value={password || ""}
          onChange={this.onPasswordChange}
          style={{ width: "290px", maxWidth: "100%", margin: "25px 0 25px 0" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKeyIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={this.onLogin}
          disabled={!isValid[1] ? true : false}
          style={{ width: "150px", maxWidth: "100%" }}
          startIcon={<ExitToAppIcon />}
        >
          Login
        </Button>
      </div>
    );
  }
}
