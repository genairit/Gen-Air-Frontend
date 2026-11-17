import { createStyles } from "../../create-styles";
import type { TAlignContent } from "./GenericPopup";
import { theme } from "../../constants/theme.constants";

interface IStyleParams {
  align: TAlignContent;
}

export const useStyles = ({ align }: IStyleParams) =>
  createStyles({
    root: {
      "& .MuiPaper-root": {
        minWidth: 0,
        overflowWrap: "anywhere",
        borderRadius: "22px",
        border: `1px solid ${theme.glass.rim}`,
        boxShadow: theme.glass.shadow,
        backgroundColor: theme.glass.strong,
        backdropFilter: theme.glass.blur,
        WebkitBackdropFilter: theme.glass.blur,
      },
      "& .MuiBackdrop-root": { backdropFilter: "blur(4px)" },
    },
    headerContainer: {
      minWidth: 0,
      py: 1,
      px: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    title: {
      minWidth: 0,
      flex: "1 1 auto",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      margin: 0,
      padding: 0,
      fontSize: 19,
      fontWeight: 700,
      fontFamily: theme.font.body,
      fontStyle: "normal",
      lineHeight: "normal",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.primary,
    },
    contentContainer: {
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
    content: {
      minWidth: 0,
      overflowWrap: "anywhere",
      textAlign: align,
    },
    signature: {
      border: `1px solid ${theme.glass.border}`,
      borderRadius: 14,
      height: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.textMuted,
    },
    guidelines: {
      textAlign: align,
      color: theme.palette.textMuted,
      fontFamily: theme.font.body,
      fontSize: 11,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
    },
    actionError: {
      fontSize: 13,
      color: theme.colors.error,
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
