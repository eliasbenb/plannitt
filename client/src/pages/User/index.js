import React, { Component } from "react";

import axios from "axios";

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.match.params.user,
      oid: this.props.match.params.oid,
      password: (
        JSON.parse(window.localStorage.getItem("recent_planners") || "{}")[
          this.props.match.params.oid
        ] || {}
      ).password,
    };
  }

  componentDidMount() {
    let { user, oid, password } = this.state;

    if (!password) {
      this.props.history.push(`/planner/${oid}`);
    }

    let req_path = `/api/v1/planner/get/${oid}/${user}`;
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

  render() {
    return <div></div>;
  }
}
