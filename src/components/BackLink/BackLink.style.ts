import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    link: {
      gap: "10px",
      fontSize: 15,
      fontWeight: 600,
      padding: "0 22px",
      alignItems: "center",
      display: "inline-flex",
      textDecoration: "none",
      color: theme.palette.charcoal,
      borderRadius: theme.radius.pill,
      height: theme.controlHeight.medium,
      boxShadow: theme.softShadow.raisedCompact,
      backgroundColor: theme.palette.iceWhite,
      "&:hover": { textDecoration: "none", color: theme.palette.charcoal },
    },
  });
