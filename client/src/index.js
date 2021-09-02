import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import { guid, Home, theme, Timetable } from "./components";

import "./index.css";

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route
          exact
          path={"/"}
          render={(props) => <Home key={guid()} {...props} />}
        />
        <Route
          exact
          path={"/timetable/:oid"}
          render={(props) => <Timetable key={guid()} {...props} />}
        />
      </Switch>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
