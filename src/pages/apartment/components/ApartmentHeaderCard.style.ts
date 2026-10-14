import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette } = theme;

export const useStyles = () =>
  createStyles({
    breadcrumb: {
      ...MUTED_CAPTION,
      gap: "8px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    crumbLink: {
      fontWeight: 600,
      textDecoration: "none",
      color: palette.primary,
    },
    currentCrumb: {
      fontWeight: 700,
      color: palette.charcoal,
    },
    identity: {
      gap: "18px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    titleBlock: {
      gap: "16px",
      display: "flex",
      alignItems: "center",
    },
    details: {
      gap: "8px",
      display: "flex",
      flexDirection: "column",
    },
    titleRow: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
    },
    stageLabel: {
      ...MUTED_CAPTION,
      gap: "6px",
      display: "flex",
      alignItems: "center",
    },
    stageTitle: {
      fontWeight: 700,
      color: palette.charcoal,
    },
  });
