import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    grid: {
      gap: "12px",
      display: "grid",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
    },
  });
