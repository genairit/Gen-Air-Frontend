import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { MONOSPACE_CAPTION, MUTED_CAPTION } from "../../styles/templates.style";

const { palette, font, softShadow } = theme;

export const useShowcaseStyles = () =>
  createStyles({
    grid: ({ minColumnWidth, gap = "24px" }: { minColumnWidth: number; gap?: string }) => ({
      gap,
      display: "grid",
      alignItems: "start",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColumnWidth}px, 100%), 1fr))`,
    }),
    row: ({ gap = "20px" }: { gap?: string }) => ({
      gap,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    }),
    spacedRow: {
      gap: "24px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stack: ({ gap = "20px" }: { gap?: string }) => ({
      gap,
      display: "flex",
      flexDirection: "column",
    }),
    topAligned: {
      alignItems: "flex-start",
    },
    fullRow: {
      gridColumn: "1 / -1",
    },
    flexItem: ({ basis }: { basis: string }) => ({
      flex: basis,
      minWidth: 0,
    }),
    label: {
      ...MUTED_CAPTION,
      fontWeight: 600,
    },
    caption: MUTED_CAPTION,
    monoCaption: MONOSPACE_CAPTION,
    strong: ({ fontSize }: { fontSize: number }) => ({
      fontSize,
      fontWeight: 700,
    }),
    link: {
      fontSize: 14,
      fontWeight: 600,
      color: palette.primary,
      textDecoration: "none",
      "&:hover": { textDecoration: "underline", color: palette.danger },
    },
    swatch: ({ color, isInsetPreview }: { color: string; isInsetPreview: boolean }) => ({
      height: 110,
      backgroundColor: color,
      borderRadius: "16px",
      boxShadow: isInsetPreview ? softShadow.insetDeep : "none",
    }),
    typography: ({ fontSize, fontWeight }: { fontSize: number; fontWeight: number }) => ({
      fontSize,
      fontWeight,
      lineHeight: 1.3,
    }),
    depthSample: {
      width: "100%",
      aspectRatio: "1",
    },
    centeredLabel: {
      gap: "10px",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    monoTokens: {
      gap: "12px",
      fontSize: 12,
      display: "flex",
      flexWrap: "wrap",
      fontFamily: font.mono,
      color: palette.textMuted,
    },
    phoneFrame: {
      width: 390,
      height: 780,
      maxWidth: "100%",
      padding: "10px",
      borderRadius: "44px",
      boxShadow: softShadow.elevated,
      backgroundColor: palette.iceWhite,
    },
    phoneScreen: {
      height: "100%",
      display: "flex",
      overflow: "hidden",
      borderRadius: "36px",
      flexDirection: "column",
      boxShadow: softShadow.insetDeep,
    },
    phoneContent: {
      flex: 1,
      gap: "16px",
      display: "flex",
      overflow: "hidden",
      padding: "28px 20px 16px",
      flexDirection: "column",
    },
    phoneNavigation: {
      display: "flex",
      padding: "0 12px 12px",
    },
    loginColumn: {
      gap: "28px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      width: "min(100%, 460px)",
    },
    centeredText: {
      gap: "6px",
      display: "flex",
      textAlign: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    centered: {
      justifyContent: "center",
    },
    bottomAligned: {
      alignItems: "end",
    },
    textCenter: {
      textAlign: "center",
    },
    elevated: {
      boxShadow: softShadow.elevated,
    },
    alignStart: {
      alignSelf: "flex-start",
    },
    fullWidth: {
      width: "100%",
    },
    narrow: {
      maxWidth: 520,
    },
  });
