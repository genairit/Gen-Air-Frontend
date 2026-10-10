import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";

export const useStyles = () =>
  createStyles({
    content: {
      gap: "10px",
      display: "inline-flex",
      alignItems: "center",
    },
    iconBadge: {
      ...CENTERED_FLEX,
      width: 34,
      height: 34,
      flexShrink: 0,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.palette.white,
    },
  });
