import {
  FREE_TEXT_COLORS,
  FREE_TEXT_SUGGESTION_CLASS_NAMES,
} from "../../../constants/free-text.constants";

import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    suggestionsContainer: {
      top: "100%",
      left: 0,
      right: 0,
      zIndex: 1000,
      borderTop: "none",
      overflow: "hidden",
      position: "absolute",
      borderRadius: "0 0 10px 10px",
      border: `1px solid ${FREE_TEXT_COLORS.ACCENT}`,
      boxShadow: "0 6px 24px rgba(31,36,48,.10)",
      backgroundColor: FREE_TEXT_COLORS.SURFACE,
    },
    suggestionsHeader: {
      padding: "9px 14px",
      fontSize: "11.5px",
      fontWeight: 500,
      color: FREE_TEXT_COLORS.MUTED,
      borderBottom: `1px solid ${FREE_TEXT_COLORS.BORDER}`,
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
    suggestionItem: {
      gap: "10px",
      display: "flex",
      fontSize: "15px",
      cursor: "pointer",
      alignItems: "center",
      padding: "9px 14px",
      transition: "background-color 0.2s",
      borderBottom: `1px solid ${FREE_TEXT_COLORS.BORDER}`,
      "&:last-child": {
        borderBottom: "none",
      },
      "&:hover": {
        backgroundColor: FREE_TEXT_COLORS.ACCENT_WEAK,
      },
      [`&.${FREE_TEXT_SUGGESTION_CLASS_NAMES.ACTIVE}`]: {
        backgroundColor: FREE_TEXT_COLORS.ACCENT_WEAK,
      },
    },
    suggestionText: {
      flex: 1,
      fontSize: "15px",
    },
    suggestionTag: {
      fontSize: "11px",
      padding: "2px 9px",
      borderRadius: "20px",
      color: FREE_TEXT_COLORS.GREEN,
      border: `1px solid ${FREE_TEXT_COLORS.GREEN_MID}`,
      backgroundColor: FREE_TEXT_COLORS.GREEN_LIGHT,
    },
  });
