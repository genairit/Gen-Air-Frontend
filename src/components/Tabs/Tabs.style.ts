import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";
import type { TabsVariantType } from "../../constants/tabs.constant";

type TTabsStyle = SystemStyleObject<Theme>;

const { palette, softShadow, radius, controlHeight } = theme;

const CONTAINER_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
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
  pills: { height: controlHeight.medium, padding: "0 22px", fontSize: 15 },
  segmented: { height: controlHeight.compact, padding: "0 18px", fontSize: 14 },
};

const ACTIVE_TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
  pills: { backgroundColor: palette.airBlue, boxShadow: softShadow.inset },
  segmented: { backgroundColor: palette.airBlue, boxShadow: softShadow.raisedSmall },
};

const IDLE_TAB_BY_VARIANT: Record<TabsVariantType, TTabsStyle> = {
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
