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
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import LinkTwoToneIcon from "@material-ui/icons/LinkTwoTone";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import axios from "axios";

import { Header, theme } from "../../components";

import "./index.css";
export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isLoaded: false,
      isLoggedIn: false,
      isValid: [false, false],
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
    this.onCopyLink = this.onCopyLink.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
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
          });
        } else {
          window.alert(data.message || "Error!");
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status == 401) {
            this.setState({ isLoaded: true, isLoggedIn: false });
          } else if (
            error.response.status == 404 ||
            error.response.status == 400
          ) {
            console.error(error);
            window.alert(error.response.data.message || "Error!");
            this.props.history.push("/");
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

  onCopyLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() =>
        window.alert("The URL was successfully copied to your clipboard.")
      );
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
          window.alert(error.response.message || "Error!");
        } else {
          window.alert("Error!");
        }
      });
  }

  onDeleteUser(n) {
    let { data, oid, password } = this.state;
    const user = data.planners[n].name;

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
          window.alert(error.response.message || "Error!");
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
        if (this.state.data.planners.some((i) => i.name == evt.target.value)) {
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

  render() {
    let { data, isLoaded, isLoggedIn, isValid, new_name, password } =
      this.state;

    return !isLoaded ? (
      <div className="Loading">
        <CircularProgress />
      </div>
    ) : isLoggedIn ? (
      <div className="page__container">
        <Header />
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #111",
            borderRadius: "10px",
            margin: "25px 0 25px 0",
          }}
        >
          <List style={{ width: "300px", maxWidth: "100%" }} dense={false}>
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
            {data.planners.length
              ? data.planners.map((planner, n) => (
                  <ListItem key={`user-${n}`}>
                    <Link
                      to={`/planner/${data._id}/${planner.name}`}
                      className="no_decoration_link"
                    >
                      <ListItemAvatar>
                        <Avatar>{planner.name.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                    </Link>
                    <Link
                      to={`/planner/${data._id}/${planner.name}`}
                      className="no_decoration_link"
                    >
                      <ListItemText
                        style={{ width: "10rem" }}
                        primary={
                          <Typography className="user_name">
                            {planner.name}
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
            {data.planners.length ? (
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
        <div style={{ display: "flex" }}>
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onDelete}
              style={{ width: "135px", maxWidth: "100%" }}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </div>
          <div className="button">
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onCopyLink}
              style={{ width: "135px", maxWidth: "100%" }}
              startIcon={<LinkTwoToneIcon />}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    ) : (
      <div className="page__container">
        <Header />
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
          style={{ width: "135px", maxWidth: "100%" }}
          startIcon={<ExitToAppIcon />}
        >
          Login
        </Button>
      </div>
    );
  }
}
