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
      password:
        JSON.parse(window.localStorage.getItem("passwords") || "{}")[
          this.props.match.params.oid
        ] || "",
    };
    this.onAddUser = this.onAddUser.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
  }

  componentDidMount() {
    let { password } = this.state;

    let req_path = `/api/v1/planner/get/${this.props.match.params.oid}`;
    let req_args = `?password=${password}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data;
        if (data.success) {
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

  onAddUser() {
    let { new_name, password } = this.state;
    const oid = this.props.match.params.oid;

    var post_data = {
      name: new_name,
      times: [],
    };

    let req_path = `/api/v1/planner/post/${oid}`;
    let req_args = `?password=${password}`;

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

  onDelete() {
    let { password } = this.state;
    const oid = this.props.match.params.oid;

    let req_path = `/api/v1/planner/pull/${oid}`;
    let req_args = `?password=${password}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
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
    let { data, password } = this.state;
    const oid = this.props.match.params.oid;
    const name = data.planners[n].name;

    let req_path = `/api/v1/planner/pull/${oid}/${name}`;
    let req_args = `?password=${password}`;

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
    let { password } = this.state;
    const oid = this.props.match.params.oid;

    let req_path = `/api/v1/planner/get/${oid}`;
    let req_args = `?password=${password}`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          let passwords = JSON.parse(
            window.localStorage.getItem("passwords") || "{}"
          );
          passwords[oid] = password;
          window.localStorage.setItem("passwords", JSON.stringify(passwords));
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
        isValid[0] = true;
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
            margin: "25px 0 25px 0",
          }}
        >
          <List style={{ width: "300px" }} dense={false}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="h5" style={{ textAlign: "center" }}>
                    {data.title}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            {data.planners.length
              ? data.planners.map((planner, n) => (
                  <ListItem key={`user-${n}`}>
                    <Link to={`/planner/${data._id}/${n}`}>
                      <ListItemAvatar>
                        <Avatar>
                          <AccountCircleIcon />
                        </Avatar>
                      </ListItemAvatar>
                    </Link>
                    <Link
                      to={`/planner/${data._id}/${n}`}
                      className="no_decoration_link"
                    >
                      <ListItemText primary={planner.name} />
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
              style={{ width: "135px" }}
              startIcon={<DeleteIcon />}
            >
              Delete
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
          style={{ width: "290px", margin: "25px 0 25px 0" }}
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
          style={{ width: "135px" }}
          startIcon={<ExitToAppIcon />}
        >
          Login
        </Button>
      </div>
    );
  }
}
