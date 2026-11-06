import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    link: {
      gap: "10px",
      fontSize: 15,
      fontWeight: 600,
      padding: "0 22px",
      alignItems: "center",
      display: "inline-flex",
      textDecoration: "none",
      color: theme.palette.charcoal,
      borderRadius: theme.radius.pill,
      height: theme.controlHeight.medium,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadowSmall,
      backgroundColor: theme.palette.white,
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
      "&:focus-visible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: 2 },
      "@media (hover: hover)": { "&:hover": { transform: "translateY(-1px)" } },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        "&:hover": { transform: "none" },
      },
      "&:hover": { textDecoration: "none", color: theme.palette.charcoal },
    },
  });
