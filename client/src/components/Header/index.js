import React, { Component } from "react";

import { Link } from "react-router-dom";

import { IconButton, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

import "./index.css";

export default class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="header_container">
        <div>
          <Link to="/" className="no_decoration_link">
            <Typography variant="h1" className="header">
              plannitt
            </Typography>
          </Link>
          <a href="https://elias.eu.org" className="no_decoration_link">
            <Typography
              variant="body1"
              className="header"
              style={{ float: "right", marginTop: "-10px" }}
            >
              eliasbenb
            </Typography>
          </a>
          <div style={{ float: "right", marginTop: "-20px" }}>
            <IconButton onClick={this.props.goBack}>
              <ArrowBackIcon />
            </IconButton>
          </div>
        </div>
      </div>
    );
  }
}
