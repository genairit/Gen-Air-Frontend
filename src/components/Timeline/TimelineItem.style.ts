import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, MONOSPACE_CAPTION, MUTED_CAPTION } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    item: {
      gap: "16px",
      display: "flex",
    },
    rail: {
      width: 20,
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    marker: {
      ...CENTERED_FLEX,
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: theme.radius.pill,
      boxShadow: theme.softShadow.raisedSmall,
      backgroundColor: theme.palette.iceWhite,
    },
    line: {
      flex: 1,
      width: 2,
      minHeight: 28,
      backgroundColor: theme.palette.divider,
    },
    content: {
      flex: 1,
      gap: "6px",
      display: "flex",
      paddingBottom: "22px",
      flexDirection: "column",
    },
    header: {
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    date: MONOSPACE_CAPTION,
    author: MUTED_CAPTION,
  });
