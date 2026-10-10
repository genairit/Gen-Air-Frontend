import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    action: {
      color: theme.palette.outline,
      boxShadow: theme.softShadow.insetCharcoal,
      backgroundColor: theme.palette.charcoalRaised,
    },
    iconCircle: {
      ...CENTERED_FLEX,
      width: 40,
      height: 40,
      opacity: 0.75,
      flexShrink: 0,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.palette.iceWhite,
    },
  });
