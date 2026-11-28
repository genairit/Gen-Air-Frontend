import { createStyles } from "../../../create-styles";

const row = {
  gap: "8px",
  minWidth: 0,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
} as const;

export const useStyles = () =>
  createStyles({
    toolbar: {
      ...row,
      gap: "12px",
      "& input": { textOverflow: "ellipsis" },
      position: "relative",
      zIndex: 2,
    },
    filters: {
      ...row,
      flex: "1 1 520px",
    },
    search: { minWidth: 0, flex: "2 1 205px" },
    typeFilter: { minWidth: 0, flex: "1 1 150px" },
    statusFilter: { minWidth: 0, flex: "1 1 159px" },
    actions: {
      ...row,
      maxWidth: "100%",
      marginInlineStart: "auto",
      justifyContent: "flex-end",
      "& > button": { maxWidth: "100%", overflowWrap: "anywhere" },
    },
  });
