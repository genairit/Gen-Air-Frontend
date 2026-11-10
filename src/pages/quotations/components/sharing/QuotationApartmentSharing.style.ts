import { createStyles } from "../../../../create-styles";
import { theme } from "../../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../../styles/templates.style";
import { MOBILE_LAYOUT_QUERY } from "../../../../constants/layout.constant";
import { QUOTATION_SHARING_LAYOUT } from "../../../../constants/quotation-sharing.constant";

const { palette, glass, radius } = theme;

export const useStyles = () =>
  createStyles({
    anchor: {
      scrollMarginTop: "24px",
    },
    caption: MUTED_CAPTION,
    summary: {
      gap: "4px",
      display: "flex",
      flexDirection: "column",
    },
    summaryTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: palette.charcoal,
    },
    panel: {
      gap: "12px",
      display: "flex",
      flexDirection: "column",
      animation: "genair-panel-reveal 180ms ease both",
      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    },
    list: {
      display: "flex",
      overflowY: "auto",
      padding: "4px 14px",
      flexDirection: "column",
      boxShadow: glass.edge,
      borderRadius: radius.badge,
      backgroundColor: palette.white,
      overscrollBehavior: "contain",
      maxHeight: QUOTATION_SHARING_LAYOUT.LIST_MAX_HEIGHT,
    },
    listRow: {
      display: "flex",
      alignItems: "center",
      minHeight: QUOTATION_SHARING_LAYOUT.ROW_HEIGHT,
      borderBottom: `1px solid ${palette.divider}`,
      "&:last-of-type": { borderBottom: "none" },
    },
    rowText: {
      gap: "2px 10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
    },
    endCustomer: MUTED_CAPTION,
    selectAll: {
      display: "flex",
      alignItems: "center",
      paddingInlineStart: "14px",
      minHeight: QUOTATION_SHARING_LAYOUT.ROW_HEIGHT,
    },
    selectionRow: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
    actions: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        flexDirection: "column",
        "& > *": { width: "100%" },
      },
    },
    unavailable: {
      gap: "8px",
      display: "flex",
      flexDirection: "column",
      color: palette.textMuted,
    },
    unavailableRow: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      minHeight: QUOTATION_SHARING_LAYOUT.ROW_HEIGHT,
    },
    status: {
      fontSize: 14,
      fontWeight: 600,
      color: palette.primary,
    },
  });
