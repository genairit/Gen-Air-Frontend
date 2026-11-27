import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useEstimateListStyles = () =>
  createStyles({
    row: {
      gap: "12px",
      width: "100%",
      display: "flex",
      padding: "12px 16px",
      textAlign: "start",
      justifyContent: "space-between",
      border: `1px solid ${theme.glass.border}`,
      borderRadius: theme.radius.badge,
      "&:hover": { backgroundColor: theme.palette.surfaceHover },
      "&.Mui-focusVisible": {
        outlineOffset: 2,
        outline: `2px solid ${theme.palette.primary}`,
      },
    },
    name: { minWidth: 0, fontWeight: 600, overflowWrap: "anywhere" },
  });
