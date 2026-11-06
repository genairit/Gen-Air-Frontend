import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";

const LIQUID_SPRING_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const LIQUID_SCALE = {
  HOVER: "scale(1.03)",
  PRESS: "scale(1.06)",
} as const;

export const smartbaseButtonMotion: SystemStyleObject = {
  transition: `transform .35s ${LIQUID_SPRING_EASING}, box-shadow .25s ease, background-color .3s ease-in-out, border-color .3s ease-in-out, color .3s ease-in-out`,
  "@media (hover: hover)": {
    "&:hover:not(:disabled)": {
      transform: LIQUID_SCALE.HOVER,
    },
  },
  "&:active:not(:disabled)": {
    transform: LIQUID_SCALE.PRESS,
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition:
      "background-color .3s ease-in-out, border-color .3s ease-in-out, color .3s ease-in-out",
    "&:hover, &:active": { transform: "none" },
  },
};
