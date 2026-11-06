import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    row: ({ checked }: { checked: boolean }) => ({
      minHeight: 56,
      display: "flex",
      padding: "0 16px",
      alignItems: "center",
      borderRadius: theme.radius.pill,
      backgroundColor: checked ? theme.palette.airBlue : theme.palette.white,
      transition: "background-color 0.2s ease, box-shadow 0.2s ease",
      boxShadow: checked ? theme.glass.selectedEdge : theme.glass.edge,
    }),
    label: {
      fontSize: 14,
      fontWeight: 500,
    },
  });
