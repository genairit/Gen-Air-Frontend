import { theme } from "../../../theme";
import { lighten } from "@mui/material";
import { createStyles } from "../../../create-styles";

const { ink, danger } = theme.colors;

const DISPLAY_FONT = "Rubik, 'Segoe UI', system-ui, sans-serif";
const HEADING_FADE = "linear-gradient(270deg, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0))";

export const useStyles = () =>
  createStyles({
    header: {
      gap: "10px",
      display: "flex",
      alignItems: "flex-start",
    },
    titles: {
      flex: 1,
      gap: "8px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    titleRow: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    title: {
      color: ink,
      margin: "0 2px",
      fontSize: "14px",
      fontWeight: 700,
      position: "relative",
      paddingBottom: "10px",
      fontFamily: DISPLAY_FONT,

      "&::after": {
        bottom: 0,
        content: "''",
        height: "2px",
        insetInline: 0,
        position: "absolute",
        borderRadius: "999px",
        backgroundColor: ink,
        maskImage: HEADING_FADE,
        WebkitMaskImage: HEADING_FADE,
      },
    },
    subtitle: {
      margin: "0 2px",
      fontSize: "12px",
      textAlign: "start",
      color: theme.text.secondary,
    },
    actions: {
      gap: "8px",
      flex: "none",
      display: "flex",
      alignItems: "center",
      marginInlineStart: "auto",
    },
    removeButton: {
      width: "30px",
      height: "30px",
      flex: "none",
      color: theme.text.secondary,
      backgroundColor: lighten(ink, 0.96),

      "&:hover": { color: danger, backgroundColor: lighten(danger, 0.88) },
    },
    removeGlyph: {
      fontSize: "16px",
    },
  });
