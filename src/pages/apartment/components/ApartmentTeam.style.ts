import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    memberRow: {
      gap: "10px",
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });
