import { createStyles } from "../../create-styles";
import type { TAlignContent } from "./GenericPopup";

interface IStyleParams {
  align: TAlignContent;
}

export const useStyles = ({ align }: IStyleParams) =>
  createStyles({
    root: {
      "& .MuiPaper-root": {
        borderRadius: "13px !important",
      },
    },
    headerContainer: {
      py: 1,
      px: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    title: {
      margin: 0,
      padding: 0,
      fontSize: 19,
      fontWeight: 700,
      fontFamily: "Rubik",
      fontStyle: "normal",
      lineHeight: "normal",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    contentContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
    content: {
      textAlign: align,
    },
    signature: {
      border: "1px solid #ccc",
      borderRadius: 2,
      height: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#888",
    },
    guidelines: {
      textAlign: align,
      color: "#73737C",
      fontFamily: "Rubik",
      fontSize: 11,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
    },
    actions: {
      px: 2,
      py: 1,
      gap: "10px",
      display: "flex",
      flexDirection: "row",
    },
    button: {
      flex: 1,
      borderRadius: "40px",
    },
  });
