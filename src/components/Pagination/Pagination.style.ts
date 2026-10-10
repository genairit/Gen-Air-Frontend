import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      display: "flex",
      alignItems: "center",
    },
    page: ({ isActive }: { isActive: boolean }) => ({
      fontWeight: 700,
      boxShadow: isActive ? theme.softShadow.pageActive : theme.softShadow.raisedCompact,
    }),
  });
