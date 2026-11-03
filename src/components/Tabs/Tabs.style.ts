import type { Theme } from "@mui/material";
import type { CSSProperties } from "react";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";
import { TABS_VARIANTS, type TabsVariantType } from "../../constants/tabs.constant";

type TTabsStyle = SystemStyleObject<Theme>;

const { palette, radius, softShadow } = theme;

const STRIP_STYLE: TTabsStyle = {
  gap: "6px",
  padding: "6px",
  borderRadius: radius.pill,
  backgroundColor: palette.white,
  boxShadow: softShadow.inset,
};

export const TAB_THUMB_STYLE: CSSProperties = {
  inset: 0,
  zIndex: 0,
  position: "absolute",
  pointerEvents: "none",
  borderRadius: radius.pill,
  background: palette.airBlue,
  boxShadow: softShadow.insetSelected,
};

const CONTAINER_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: STRIP_STYLE,
  pills: STRIP_STYLE,
  segmented: STRIP_STYLE,
};

const TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: { flex: "1 1 auto", minHeight: 40, padding: "0 16px", fontSize: 14 },
  pills: { minHeight: 40, padding: "0 16px", fontSize: 14 },
  segmented: { minHeight: 40, padding: "0 16px", fontSize: 14 },
};

interface ITabStyleOptions {
  isFullWidth: boolean;
  variant: TabsVariantType;
}

export const useStyles = () => ({
  container: ({ variant, isFullWidth }: ITabStyleOptions): TTabsStyle => ({
    display: "flex",
    position: "relative",
    width: isFullWidth ? "100%" : "fit-content",
    maxWidth: "100%",
    flexWrap: isFullWidth ? "nowrap" : "wrap",
    alignSelf: isFullWidth ? "stretch" : "flex-start",
    ...(variant === TABS_VARIANTS.SEGMENTED &&
      isFullWidth && { display: "grid", gridAutoFlow: "column", gridAutoColumns: "1fr" }),
    ...CONTAINER_BY_VARIANT[variant],
    ...(variant === TABS_VARIANTS.STATUS &&
      isFullWidth && {
        boxSizing: "border-box",
        [`@media ${MOBILE_LAYOUT_QUERY}`]: { flexWrap: "wrap" },
      }),
  }),
  tab: ({ variant, isFullWidth }: ITabStyleOptions): TTabsStyle => ({
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    fontWeight: 600,
    fontFamily: "inherit",
    color: palette.charcoal,
    borderRadius: radius.pill,
    flex: isFullWidth ? 1 : "0 0 auto",
    transition: "color 0.18s ease",
    ...TAB_BY_VARIANT[variant],
    background: "transparent",
    boxShadow: "none",
    ...(variant === TABS_VARIANTS.STATUS &&
      isFullWidth && {
        [`@media ${MOBILE_LAYOUT_QUERY}`]: {
          minWidth: 0,
          maxWidth: "100%",
          flex: "1 1 auto",
          overflowWrap: "anywhere",
        },
      }),
    "&.Mui-focusVisible": { outline: `2px solid ${palette.primary}`, outlineOffset: -3 },
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  }),
  tabContent: {
    gap: "10px",
    zIndex: 1,
    display: "inline-flex",
    alignItems: "center",
    position: "relative",
  } satisfies TTabsStyle,
  count: {
    fontSize: 11,
    color: palette.textMuted,
  } satisfies TTabsStyle,
});
