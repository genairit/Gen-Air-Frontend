import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";

const { palette, radius, glass } = theme;

const ACTIVE_ITEM_STYLE = {
  color: palette.primary,
  backgroundColor: palette.airBlue,
};

const IDLE_ITEM_STYLE = {
  color: palette.charcoal,
  backgroundColor: "transparent",
  "&:hover": { backgroundColor: palette.surfaceHover },
};

export const useStyles = () =>
  createStyles({
    item: ({ isActive }: { isActive: boolean }) => (isActive ? ACTIVE_ITEM_STYLE : IDLE_ITEM_STYLE),
    iconCircle: ({ isActive }: { isActive: boolean }) => ({
      ...CENTERED_FLEX,
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: radius.pill,
      opacity: isActive ? 1 : 0.8,
      backgroundColor: palette.white,
      boxShadow: glass.shadowSmall,
    }),
    label: {
      flex: 1,
      textAlign: "start",
    },
  });
