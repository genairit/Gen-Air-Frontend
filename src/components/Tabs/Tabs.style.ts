import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";
import type { TabsVariantType } from "../../constants/tabs.constant";

type TTabsStyle = SystemStyleObject<Theme>;

const { palette, softShadow, radius, controlHeight } = theme;

const CONTAINER_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: {
    flexWrap: "wrap",
    gap: "4px",
    padding: "4px",
    borderRadius: "999px",
    boxShadow: softShadow.inset,
    backgroundColor: palette.iceWhite,
  },
  pills: { gap: "14px" },
  segmented: {
    gap: "6px",
    padding: "6px",
    borderRadius: "28px",
    boxShadow: softShadow.inset,
    backgroundColor: palette.iceWhite,
  },
};

const TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: { flex: "1 1 auto", minHeight: 36, padding: "8px 14px", fontSize: 13 },
  pills: { height: controlHeight.medium, padding: "0 22px", fontSize: 15 },
  segmented: { height: controlHeight.compact, padding: "0 18px", fontSize: 14 },
};

const ACTIVE_TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: { backgroundColor: palette.iceWhite, boxShadow: softShadow.raisedSmall },
  pills: { backgroundColor: palette.airBlue, boxShadow: softShadow.inset },
  segmented: { backgroundColor: palette.airBlue, boxShadow: softShadow.raisedSmall },
};

const IDLE_TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  status: { backgroundColor: "transparent", boxShadow: "none" },
  pills: { backgroundColor: palette.iceWhite, boxShadow: softShadow.raisedMedium },
  segmented: { backgroundColor: "transparent", boxShadow: "none" },
};

interface ITabStyleOptions {
  isActive: boolean;
  isFullWidth: boolean;
  variant: TabsVariantType;
}

const getTabStateStyle = ({ variant, isActive }: Omit<ITabStyleOptions, "isFullWidth">) => {
  if (isActive) {
    return ACTIVE_TAB_BY_VARIANT[variant];
  }

  return IDLE_TAB_BY_VARIANT[variant];
};

export const useStyles = () => ({
  container: ({ variant, isFullWidth }: Omit<ITabStyleOptions, "isActive">): TTabsStyle => ({
    display: "flex",
    flexWrap: isFullWidth ? "nowrap" : "wrap",
    alignSelf: isFullWidth ? "stretch" : "flex-start",
    ...CONTAINER_BY_VARIANT[variant],
  }),
  tab: ({ variant, isActive, isFullWidth }: ITabStyleOptions): TTabsStyle => ({
    gap: "6px",
    fontWeight: 600,
    fontFamily: "inherit",
    color: palette.charcoal,
    borderRadius: radius.pill,
    flex: isFullWidth ? 1 : "0 0 auto",
    transition: "box-shadow 0.2s ease, background-color 0.2s ease",
    ...TAB_BY_VARIANT[variant],
    ...getTabStateStyle({ variant, isActive }),
  }),
  count: {
    fontSize: 12,
    color: palette.textMuted,
  } satisfies TTabsStyle,
});
