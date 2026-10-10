import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const DEFAULT_BORDER_RADIUS = 27;

export const useStyles = () =>
  createStyles({
    root: {
      width: "90%",
      height: "60px",
      display: "flex",
      position: "relative",
      borderRadius: DEFAULT_BORDER_RADIUS,
      backgroundColor: theme.colors.white,
      boxShadow: `3px 3px 3px 3px ${theme.shadow.default}`,
    },
    slider: (value: boolean = true) => ({
      top: 0,
      bottom: 0,
      width: "50%",
      position: "absolute",
      left: value ? "50%" : "0%",
      transition: "left 0.5s ease",
      background: value
        ? theme.background.purpleGradient
        : theme.background.flippedPurpleGradient,
      borderTopLeftRadius: !value ? DEFAULT_BORDER_RADIUS : 0,
      borderTopRightRadius: value ? DEFAULT_BORDER_RADIUS : 0,
      borderBottomLeftRadius: !value ? DEFAULT_BORDER_RADIUS : 0,
      borderBottomRightRadius: value ? DEFAULT_BORDER_RADIUS : 0,
    }),
    button: (value: boolean = false) => ({
      flex: 1,
      zIndex: 1,
      width: "50%",
      fontSize: 16,
      fontWeight: 500,
      whiteSpace: "normal",
      wordWrap: "break-word",
      transition: "color 0.3s ease",
      color: value ? theme.colors.white : theme.colors.black,
    }),
  });
