import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Typography } from "@material-ui/core";

import "./index.css";

export default class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Link to="/" className="no_decoration_link">
        <Typography variant="h1" className="title">
          plannitt
        </Typography>
      </Link>
    );
  }
}
