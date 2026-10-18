import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    content: {
      gap: "16px",
      display: "flex",
      textAlign: "start",
      flexDirection: "column",
    },
    body: {
      fontSize: 15,
      lineHeight: 1.7,
      color: palette.charcoal,
    },
    preview: {
      gap: "4px",
      display: "flex",
      padding: "14px 16px",
      borderRadius: "16px",
      flexDirection: "column",
      color: palette.white,
      backgroundColor: palette.charcoal,
    },
    previewSender: {
      fontSize: 12,
      opacity: 0.75,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: 700,
    },
    previewBody: {
      fontSize: 13,
      opacity: 0.9,
    },
  });
