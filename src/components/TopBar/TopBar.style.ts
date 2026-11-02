import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    bar: {
      gap: "16px",
      minHeight: 76,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      padding: "12px 24px 12px 14px",
      justifyContent: "space-between",
      borderRadius: theme.radius.card,
      border: `1px solid ${theme.glass.rim}`,
      boxShadow: theme.glass.shadow,
      backgroundColor: theme.glass.strong,
      backdropFilter: theme.glass.blur,
      WebkitBackdropFilter: theme.glass.blur,
    },
    title: {
      fontSize: 18,
      fontWeight: 700,
    },
  });
