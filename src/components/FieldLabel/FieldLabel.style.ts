import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "6px",
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    title: ({ hasError }: { hasError: boolean }) => ({
      fontSize: 14,
      fontWeight: 600,
      color: hasError ? theme.palette.danger : theme.palette.charcoal,
    }),
    requiredMark: {
      color: theme.palette.primary,
    },
    hint: {
      fontWeight: 400,
      color: theme.palette.textMuted,
    },
  });
