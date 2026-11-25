import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    markdown: {
      gap: "8px",
      display: "flex",
      flexDirection: "column",
      "& p, & ul, & ol": { margin: 0 },
      "& ul, & ol": {
        gap: "4px",
        display: "flex",
        flexDirection: "column",
        paddingInlineStart: "20px",
      },
      "& strong": { fontWeight: 700 },
    },
    line: {
      display: "block",
    },
  });
