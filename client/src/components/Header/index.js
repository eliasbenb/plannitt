import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Avatar, IconButton, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

import { theme } from "../../components";
import "./index.css";

export default class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="header_container">
        <IconButton onClick={this.props.goBack} style={{ marginRight: "20px" }}>
          <Avatar style={{ backgroundColor: theme.palette.secondary.main }}>
            <ArrowBackIcon />
          </Avatar>
        </IconButton>
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
        </div>
        <IconButton
          onClick={this.props.goForward}
          style={{ marginLeft: "20px" }}
        >
          <Avatar style={{ backgroundColor: theme.palette.secondary.main }}>
            <ArrowForwardIcon />
          </Avatar>
        </IconButton>
      </div>
    );
  }
}
