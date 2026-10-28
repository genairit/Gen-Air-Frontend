import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, radius, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    popup: {
      "& .MuiDialog-paper": {
        width: "100%",
        maxWidth: 1000,
        borderRadius: "28px !important",
        backgroundColor: palette.iceWhite,
        fontFamily: theme.font.body,
      },
      "& .MuiDialogTitle-root": { fontFamily: theme.font.body, fontSize: 20 },
      "& .MuiDialogContent-root": { padding: "8px 28px 20px" },
      "& .MuiDialogActions-root": { padding: "16px 28px 22px" },
    },
    stack: { display: "flex", flexDirection: "column", gap: "16px", textAlign: "right" },
    muted: { color: palette.textMuted, fontSize: 13, lineHeight: 1.7 },
    panel: {
      borderRadius: radius.panel,
      padding: "16px 18px",
      boxShadow: softShadow.inset,
      backgroundColor: palette.iceWhite,
    },
    processingTrack: { height: 8, borderRadius: radius.pill, backgroundColor: palette.airBlue },
    steps: { display: "flex", gap: "12px", marginBottom: "12px" },
    step: { display: "flex", flex: 1, gap: "10px", alignItems: "center", fontSize: 13 },
    marker: ({ active }: { active: boolean }) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      color: active ? palette.white : palette.textMuted,
      backgroundColor: active ? palette.primary : palette.iceWhite,
      boxShadow: softShadow.raisedSmall,
    }),
    tiles: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "12px",
    },
    count: { fontSize: 26, fontWeight: 800, color: palette.primary },
    chip: {
      padding: "4px 10px",
      borderRadius: radius.pill,
      backgroundColor: palette.airBlue,
      color: palette.danger,
      fontSize: 12,
    },
    error: {
      padding: "20px",
      borderRadius: radius.card,
      backgroundColor: palette.errorSurface,
      color: palette.danger,
    },
    rows: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      maxHeight: 220,
      overflow: "auto",
      padding: "8px",
      borderRadius: radius.panel,
      boxShadow: softShadow.inset,
    },
    row: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
      padding: "10px 12px",
      fontSize: 13,
    },
    code: { fontFamily: theme.font.mono, direction: "ltr", textAlign: "right", fontSize: 12 },
    actions: { display: "flex", flexWrap: "wrap", gap: "10px" },
  });
