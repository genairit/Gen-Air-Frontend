import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: { gap: "16px", display: "flex", flexDirection: "column" },
    toggle: {
      gap: "16px",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "24px",
      boxShadow: theme.softShadow.raisedMedium,
    },
    copy: { gap: "2px", display: "flex", flexDirection: "column" },
    title: { fontSize: 15, fontWeight: 700 },
    subtitle: { fontSize: 12, color: theme.palette.textMuted },
    height: { width: "100%", maxWidth: "360px" },
    unit: { fontSize: 14, fontWeight: 600, color: theme.palette.textMuted },
  });
