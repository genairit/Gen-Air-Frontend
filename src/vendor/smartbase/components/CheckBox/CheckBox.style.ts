import { theme } from "../../theme";
import { alpha } from "@mui/material";
import { createStyles } from "../../create-styles";

const BOX_SIZE = 22;
const BOX_RADIUS = "7px";
const TRANSITION = ".16s ease";
const BOX_RING = `inset 0 0 0 1.5px ${theme.border.subtle}`;
const CHECKED_GLOW = `0 4px 8px ${alpha(theme.colors.violet, 0.3)}`;
const UNCHECKED_GLOW = `0 4px 8px ${alpha(theme.colors.violet, 0)}`;

export const useStyles = () =>
  createStyles({
    root: (textColor: string) => ({
      gap: "10px",
      margin: 0,
      display: "flex",
      width: "fit-content",
      alignItems: "center",
      WebkitTapHighlightColor: "transparent",

      "& .MuiFormControlLabel-label, & .MuiFormControlLabel-label.Mui-disabled": {
        flex: 1,
        lineHeight: 1.4,
        fontSize: "13.5px",
        textAlign: "start",
        userSelect: "none",
        color: textColor,
      },
    }),
    disabledState: (disabled: boolean) => ({
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "default" : "pointer",
    }),
    checkbox: {
      padding: 0,
      borderRadius: BOX_RADIUS,

      "&:hover": { backgroundColor: "transparent" },

      "&.Mui-focusVisible": {
        outlineOffset: "2px",
        outline: `2px solid ${theme.colors.lightPurple}`,
      },
    },
    box: ({ checked, shape }: { checked: boolean; shape: "square" | "circle" }) => ({
      width: BOX_SIZE,
      height: BOX_SIZE,
      flex: "0 0 auto",
      display: "grid",
      position: "relative",
      placeItems: "center",
      boxSizing: "border-box",
      borderRadius: shape === "circle" ? "50%" : BOX_RADIUS,
      color: theme.colors.white,
      backgroundColor: theme.colors.white,
      transition: `box-shadow ${TRANSITION}`,
      boxShadow: `${BOX_RING}, ${checked ? CHECKED_GLOW : UNCHECKED_GLOW}`,

      "&::before": {
        content: '""',
        inset: 0,
        position: "absolute",
        borderRadius: "inherit",
        background: theme.background.purpleGradient,
        opacity: checked ? 1 : 0,
        transition: `opacity ${TRANSITION}`,
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        "&::before": { transition: "none" },
      },
    }),
    check: (checked: boolean) => ({
      fontSize: "14px",
      position: "relative",
      opacity: checked ? 1 : 0,
      transform: checked ? "scale(1)" : "scale(.6)",
      transition: `opacity ${TRANSITION}, transform ${TRANSITION}`,
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    }),
  });
