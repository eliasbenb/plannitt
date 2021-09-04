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
      <div>
        <Link to="/" className="no_decoration_link">
          <Typography variant="h1" className="header">
            plannitt
          </Typography>
        </Link>
        <a href="https://eliasbenb.cf" className="no_decoration_link">
          <Typography
            variant="body1"
            className="header"
            style={{ float: "right", marginTop: "-15px" }}
          >
            eliasbenb
          </Typography>
        </a>
      </div>
    );
  }
}
