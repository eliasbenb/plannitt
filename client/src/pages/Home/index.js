import React, { Component } from "react";

import { Button, IconButton } from "@material-ui/core";

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Home">
        <Button variant="outlined" color="primary">
          Secondary
        </Button>
      </div>
    );
  }
}
