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

import axios from "axios";

import { theme } from "../../components";

import "./index.css";

export default class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isLoaded: false,
      isValid: [false],
      new_name: "",
    };
    this.onAddUser = this.onAddUser.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
  }

  componentDidMount() {
    let req_path = `/api/v1/planner/get/${this.props.match.params.oid}`;
    let req_args = "";

    axios
      .get(req_path + req_args)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          this.setState({
            data: data.content,
            isLoaded: true,
          });
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

  onAddUser() {
    let { data, new_name } = this.state;
    const oid = data._id;

    var post_data = {
      name: new_name,
      times: [],
    };

    let req_path = `/api/v1/planner/post/${oid}`;
    let req_args = "";

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
    let { data } = this.state;
    const oid = data._id;

    let req_path = `/api/v1/planner/pull/${oid}`;
    let req_args = "";

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
    let { data } = this.state;
    const oid = data._id;
    const name = data.planners[n].name;

    let req_path = `/api/v1/planner/pull/${oid}/${name}`;
    let req_args = "";

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

  render() {
    let { data, isLoaded, isValid, new_name } = this.state;
    return isLoaded ? (
      <div className="page__container">
        <Typography variant="h1" className="title">
          plannitt
        </Typography>
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
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
