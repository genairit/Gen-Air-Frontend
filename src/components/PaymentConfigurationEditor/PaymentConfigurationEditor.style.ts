import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, radius, glass } = theme;
export const useStyles = () =>
  createStyles({
    root: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
    choices: { display: "flex", flexWrap: "wrap", gap: "10px" },
    choice: {
      padding: "12px 18px",
      fontSize: 13,
      fontWeight: 600,
      borderRadius: radius.pill,
      backgroundColor: palette.iceWhite,
      boxShadow: glass.edge,
      '&[aria-checked="true"]': {
        backgroundColor: palette.surfaceHover,
        boxShadow: glass.selectedEdge,
      },
    },
    stage: ({ hasAmount }: { hasAmount: boolean }) => ({
      display: "grid",
      gridTemplateColumns: hasAmount
        ? "90px minmax(0, 1fr) 100px 40px"
        : "90px minmax(0, 1fr) 40px",
      gap: "14px",
      alignItems: "center",
      minWidth: 0,
      "@media (max-width:600px)": {
        gridTemplateColumns: hasAmount ? "80px minmax(0, 1fr) 40px" : "80px minmax(0, 1fr) 40px",
      },
    }),
    description: { minWidth: 0 },
    amount: {
      direction: "ltr",
      color: palette.textMuted,
      fontSize: 13,
      "@media (max-width:600px)": { gridColumn: "2", gridRow: "2" },
    },
    remove: { gridColumn: "-2 / -1", gridRow: 1 },
    row: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
    caption: { fontSize: 13, color: palette.textMuted, overflowWrap: "anywhere" },
  });
