import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const HIT_AREA_PX = 40;

export const useStyles = () =>
  createStyles({
    action: {
      width: HIT_AREA_PX,
      height: HIT_AREA_PX,
      color: theme.palette.charcoal,
      "&.Mui-focusVisible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: "2px" },
    },
  });
