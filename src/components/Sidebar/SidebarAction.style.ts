import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    action: {
      color: theme.palette.charcoal,
      boxShadow: theme.softShadow.raisedMedium,
      backgroundColor: theme.palette.iceWhite,
    },
    iconCircle: {
      ...CENTERED_FLEX,
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: theme.radius.pill,
      boxShadow: theme.softShadow.raisedSmall,
      backgroundColor: theme.palette.iceWhite,
    },
  });
