import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    folder: { whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "start", minWidth: 0 },
    stack: { display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 },
    actions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" },
    path: { overflowWrap: "anywhere", color: theme.palette.textMuted, fontSize: 14 },
    dialog: {
      overflowWrap: "anywhere",
      borderRadius: theme.radius.panel,
      backgroundColor: theme.palette.iceWhite,
    },
  });
