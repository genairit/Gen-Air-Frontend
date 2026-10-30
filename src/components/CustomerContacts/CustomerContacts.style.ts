import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MUTED_CAPTION } from "../../styles/templates.style";

const { palette, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    caption: MUTED_CAPTION,
    summary: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "4px",
      minWidth: 0,
    },
    chips: { display: "flex", flexWrap: "wrap", gap: "8px" },
    chip: {
      display: "inline-flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "4px 8px",
      minHeight: "34px",
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: 13,
      overflowWrap: "anywhere",
      backgroundColor: palette.iceWhite,
      boxShadow: softShadow.raisedSelectedSmall,
    },
    item: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px 18px",
      padding: "14px 18px",
      borderRadius: "20px",
      boxShadow: softShadow.raisedCompact,
    },
    identity: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: 0,
      flex: "1 1 220px",
    },
    details: {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      minWidth: 0,
      overflowWrap: "anywhere",
    },
    name: { fontSize: 15, fontWeight: 700 },
    communication: {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      minWidth: 0,
      flex: "1 1 200px",
      overflowWrap: "anywhere",
    },
    phone: { fontSize: 14, fontWeight: 600, color: palette.charcoal, textAlign: "start" },
    email: { fontSize: 13, color: palette.textMuted, textAlign: "start" },
    editor: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      borderRadius: "22px",
      padding: "20px",
      boxShadow: softShadow.inset,
    },
    fields: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
      gap: "16px",
    },
    empty: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "32px 20px",
      textAlign: "center",
      border: `2px dashed ${palette.spinnerTrack}`,
      borderRadius: "20px",
    },
  });
