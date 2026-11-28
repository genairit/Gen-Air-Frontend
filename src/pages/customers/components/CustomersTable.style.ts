import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    searchActions: {
      gap: "12px",
      minWidth: 0,
      width: "100%",
      display: "flex",
      flex: "0 1 560px",
      alignItems: "center",
      "& > button": { flexShrink: 0 },
    },
    search: { flex: 1, minWidth: 0 },
  });
