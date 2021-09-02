import { createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4197fe",
    },
    secondary: {
      main: "#68a0e5",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ff9800",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#131516",
      paper: "#171819",
    },
    text: {
      primary: "#e8e6e3",
    },
    common: {
      main: "#ffffff",
    },
  },
});

export default theme;
