import { theme } from "../../theme";
import { alpha } from "@mui/material";
import { createStyles } from "../../create-styles";

const GLASS_SHADOW = [
  `0 10px 32px -10px ${alpha(theme.colors.ink, 0.18)}`,
  `0 2px 8px -2px ${alpha(theme.colors.ink, 0.08)}`,
  `inset 0 1px 0 0 ${alpha(theme.colors.white, 0.9)}`,
  `inset 0 0 0 1px ${alpha(theme.colors.white, 0.95)}`,
  `inset 0 -14px 24px -18px ${alpha(theme.colors.deepPurple, 0.3)}`,
].join(", ");

export const useStyles = () =>
  createStyles({
    card: {
      gap: "12px",
      display: "flex",
      padding: "16px",
      position: "relative",
      borderRadius: "22px",
      flexDirection: "column",
      boxShadow: GLASS_SHADOW,
      backgroundColor: alpha(theme.colors.white, 0.71),
      border: `1px solid ${alpha(theme.colors.white, 0.72)}`,
    },
  });
