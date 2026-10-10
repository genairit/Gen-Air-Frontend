import type { CSSProperties } from "react";
import { createStyles } from "../../create-styles";
import { FREE_TEXT_COLORS } from "../../constants/free-text.constants";

interface IStylesParams {
  isOpen: boolean;
  isFocused: boolean;
}

export const ENTRY_STYLE: CSSProperties = {
  border: 0,
  outline: 0,
  flex: "1 1 90px",
  minWidth: "90px",
  fontSize: "15px",
  direction: "rtl",
  padding: "5px 2px",
  fontFamily: "inherit",
  background: "transparent",
  color: FREE_TEXT_COLORS.FOREGROUND,
};

export const ENTRY_INLINE_STYLE: CSSProperties = {
  ...ENTRY_STYLE,
  flex: "0 0 auto",
  minWidth: "20px",
};

export const useStyles = ({ isOpen, isFocused }: IStylesParams) =>
  createStyles({
    container: {
      width: "100%",
    },
    labelRow: {
      gap: "6px",
      display: "flex",
      marginBottom: "6px",
      alignItems: "center",
    },
    label: {
      margin: 0,
      fontSize: "17px",
      fontWeight: 500,
      color: FREE_TEXT_COLORS.FOREGROUND,
    },
    fieldWrap: {
      width: "100%",
      position: "relative",
    },
    field: {
      gap: "7px",
      display: "flex",
      cursor: "text",
      flexWrap: "wrap",
      minHeight: "52px",
      padding: "9px 12px",
      alignItems: "center",
      backgroundColor: FREE_TEXT_COLORS.SURFACE,
      borderRadius: isOpen ? "10px 10px 0 0" : "10px",
      transition: "border-color .15s, box-shadow .15s",
      boxShadow: isFocused ? `0 0 0 3px ${FREE_TEXT_COLORS.ACCENT_WEAK}` : "none",
      border: `1px solid ${isFocused ? FREE_TEXT_COLORS.ACCENT : FREE_TEXT_COLORS.BORDER}`,
    },
    errorText: {
      fontSize: "13px",
      fontWeight: 500,
      marginTop: "6px",
      color: FREE_TEXT_COLORS.RED,
    },
  });
