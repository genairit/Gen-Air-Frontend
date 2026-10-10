import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

export const getNavigationIconColor = (isActive: boolean) =>
  isActive ? palette.charcoal : palette.sidebarMuted;

export const getNavigationDotColor = (isActive: boolean) =>
  isActive ? palette.primary : palette.mobileNavDot;

export const useStyles = () =>
  createStyles({
    bar: ({ itemCount }: { itemCount: number }) => ({
      gap: "6px",
      height: 84,
      width: "100%",
      maxWidth: 420,
      padding: "10px",
      display: "grid",
      borderRadius: radius.pill,
      boxShadow: softShadow.elevated,
      backgroundColor: palette.charcoal,
      gridTemplateColumns: `repeat(${itemCount}, 1fr)`,
    }),
    item: ({ isActive }: { isActive: boolean }) => ({
      gap: "4px",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "inherit",
      flexDirection: "column",
      borderRadius: radius.pill,
      color: getNavigationIconColor(isActive),
      backgroundColor: isActive ? palette.airBlue : "transparent",
    }),
  });
