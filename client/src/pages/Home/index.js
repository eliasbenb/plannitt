import React, { Component } from "react";

import {
  Button,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SearchIcon from "@material-ui/icons/Search";
import TitleIcon from "@material-ui/icons/Title";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import axios from "axios";

import { Header } from "../../components";

import "./index.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
      error: false,
      isCreator: false,
      isPublic: true,
      isValid: [false, false, true],
      mode: "timetable",
      password: null,
      title: null,
    };
    this.onCodeChange = this.onCodeChange.bind(this);
    this.onCodeSearch = this.onCodeSearch.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onCreateSubmit = this.onCreateSubmit.bind(this);
    this.onMode = this.onMode.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onPublic = this.onPublic.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
  }

  onCodeChange(evt) {
    if (evt.target.value != this.state.code) {
      if (evt.target.value) {
        var isValid = this.state.isValid;
        isValid[0] = true;
        this.setState({ code: evt.target.value, isValid: isValid });
      } else {
        var isValid = this.state.isValid;
        isValid[0] = false;
        this.setState({ code: null, isValid: isValid });
      }
    }
  }

  onCodeSearch() {
    let { code } = this.state;

    this.props.history.push(`/planner/${code}`);
  }

  onCreate() {
    this.setState({ isCreator: true });
  }

  onCreateSubmit() {
    let { isPublic, mode, password, title } = this.state;

    var post_data;
    if (isPublic == false) {
      post_data = {
        mode: mode,
        password: password,
        planners: [],
        public: false,
        title: title,
        type: "group",
      };
    } else {
      post_data = {
        mode: mode,
        password: null,
        planners: [],
        public: true,
        title: title,
        type: "group",
      };
    }

    let req_path = "/api/v1/planner/post";
    let req_args = "";

    axios
      .post(req_path + req_args, post_data)
      .then((response) => {
        let data = response.data;
        if (data.success) {
          this.props.history.push(`/planner/${data.content.insertedId}`);
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

  onMode() {
    if (this.state.mode == "calendar") {
      this.setState({ mode: "timetable" });
    } else {
      this.setState({ mode: "calendar" });
    }
  }

  onPasswordChange(evt) {
    if (evt.target.value != this.state.password) {
      if (evt.target.value) {
        var isValid = this.state.isValid;
        isValid[2] = true;
        this.setState({ password: evt.target.value, isValid: isValid });
      } else {
        var isValid = this.state.isValid;
        isValid[2] = false;
        this.setState({ password: evt.target.value, isValid: isValid });
      }
    }
  }

  onPublic() {
    if (this.state.isPublic) {
      var isValid = this.state.isValid;
      if (this.state.password) {
        isValid[2] = true;
      } else {
        isValid[2] = false;
      }
      this.setState({ isPublic: false, isValid: isValid });
    } else {
      var isValid = this.state.isValid;
      isValid[2] = true;
      this.setState({ isPublic: true, isValid: isValid });
    }
  }

  onTitleChange(evt) {
    if (evt.target.value != this.state.title) {
      if (evt.target.value) {
        var isValid = this.state.isValid;
        isValid[1] = true;
        this.setState({ title: evt.target.value, isValid: isValid });
      } else {
        var isValid = this.state.isValid;
        isValid[1] = false;
        this.setState({ title: evt.target.value, isValid: isValid });
      }
    }
  }

  render() {
    let { code, isCreator, isPublic, isValid, mode, password, title } =
      this.state;
    return !isCreator ? (
      <div className="Home">
        <div className="page__container">
          <Header />
          <div style={{ margin: "25px 0 25px 0" }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              style={{ height: "100px", width: "300px", maxWidth: "100%" }}
              startIcon={<AddCircleIcon />}
              onClick={this.onCreate}
            >
              Create Planner
            </Button>
          </div>
          <TextField
            label="Planner Code"
            value={code || ""}
            onChange={this.onCodeChange}
            style={{ width: "290px", maxWidth: "100%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.onCodeSearch}
            disabled={!isValid[0] ? true : false}
            style={{ width: "135px", maxWidth: "100%", marginTop: "25px" }}
            startIcon={<ExitToAppIcon />}
          >
            Search
          </Button>
        </div>
      </div>
    ) : (
      <div className="Home">
        <div className="page__container">
          <Header />
          <div style={{ margin: "25px 0 25px 0" }}>
            <TextField
              label="Planner Title"
              value={title || ""}
              onChange={this.onTitleChange}
              style={{ width: "290px", maxWidth: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          {!isPublic ? (
            <TextField
              label="Planner Password"
              value={password || ""}
              onChange={this.onPasswordChange}
              style={{ width: "290px", maxWidth: "100%", marginBottom: "25px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon />
                  </InputAdornment>
                ),
              }}
            />
          ) : null}
          <div style={{ display: "flex" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={this.onPublic}
                  name="public"
                  color="primary"
                />
              }
              label={!isPublic ? "Private" : "Public"}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={mode == "timetable"}
                  onChange={this.onMode}
                  name="mode"
                  color="primary"
                />
              }
              label={mode.charAt(0).toUpperCase() + mode.slice(1)}
            />
          </div>
          <Button
            variant="outlined"
            color="primary"
            disabled={isValid[1] && isValid[2] ? false : true}
            style={{ height: "65px", width: "300px", maxWidth: "100%", marginTop: "100px" }}
            startIcon={<AddCircleIcon />}
            onClick={this.onCreateSubmit}
          >
            Create Planner
          </Button>
        </div>
      </div>
    );
  }
}
