import { createStyles } from "../create-styles";
import { theme } from "../constants/theme.constants";
import { MUTED_CAPTION } from "../styles/templates.style";

const { palette } = theme;

export const usePageStyles = () =>
  createStyles({
    page: {
      gap: "28px",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    headerText: {
      gap: "6px",
      maxWidth: 640,
      display: "flex",
      flexDirection: "column",
    },
    heading: {
      margin: 0,
      fontSize: 32,
      fontWeight: 800,
    },
    description: {
      fontSize: 15,
      textWrap: "pretty",
      color: palette.textMuted,
    },
    eyebrow: {
      ...MUTED_CAPTION,
      gap: "8px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
    },
    caption: MUTED_CAPTION,
    grid: ({ minColumnWidth, gap = "24px" }: { minColumnWidth: number; gap?: string }) => ({
      gap,
      display: "grid",
      alignItems: "start",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumnWidth}px, 100%), 1fr))`,
    }),
    row: ({ gap = "14px" }: { gap?: string }) => ({
      gap,
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "center",
    }),
    endRow: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    },
    spacedRow: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stack: ({ gap = "24px" }: { gap?: string }) => ({
      gap,
      display: "flex",
      flexDirection: "column",
    }),
    flexItem: ({ basis }: { basis: string }) => ({
      flex: basis,
      minWidth: 0,
    }),
    statusCaption: {
      ...MUTED_CAPTION,
      gap: "8px",
      display: "flex",
      alignItems: "center",
    },
    fullWidth: {
      width: "100%",
    },
    bottomAligned: {
      alignItems: "end",
    },
    spanTwoColumns: {
      gridColumn: "span 2",
      minWidth: 0,
      "@media (max-width: 600px)": { gridColumn: "auto" },
    },
  });
