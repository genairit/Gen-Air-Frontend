import {
  AUTOCOMPLETE_TOKENS as TOKENS,
  AUTOCOMPLETE_MOTION as MOTION,
  AUTOCOMPLETE_ANIMATIONS as ANIMATIONS,
} from "../../../../constants/autocomplete.constant";

import { alpha } from "@mui/material";
import { createStyles } from "../../../../create-styles";
import { type IAutocompleteColors } from "../../../../interfaces/autocomplete.interface";

const optionRow = {
  gap: "2px",
  width: "100%",
  display: "flex",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: 1.25,
  minHeight: "44px",
  textAlign: "start",
  padding: "9px 16px",
  boxSizing: "border-box",
  flexDirection: "column",
  justifyContent: "center",
  fontFamily: TOKENS.FONT_FAMILY,
  backgroundColor: alpha(TOKENS.SURFACE, 0.4),
  borderTop: `1px solid ${alpha(TOKENS.BORDER, 0.58)}`,

  "&:first-of-type": { borderTop: 0 },
} as const;

export const useStyles = (colors: IAutocompleteColors, maxHeight: number) =>
  createStyles({
    list: {
      overflowY: "auto",
      overflowX: "hidden",
      scrollbarWidth: "thin",
      scrollbarColor: `${alpha(colors.placeholder, 0.36)} transparent`,
      maxHeight: `${maxHeight}px`,
      overscrollBehavior: "contain",
    },
    option: {
      ...optionRow,
      cursor: "pointer",
      userSelect: "none",
      position: "relative",
      color: colors.text,
      alignItems: "stretch",
      WebkitTapHighlightColor: "transparent",
      "&[aria-selected='true']": { color: colors.accent },
      transition: "background-color 0.14s ease, color 0.14s ease",
      "& mark": { color: "inherit", fontWeight: 900, backgroundColor: "transparent" },
    },
    activeOption: {
      backgroundColor: alpha(colors.accent, 0.25),
    },
    optionText: {
      width: "100%",
      boxSizing: "border-box",
      paddingInlineEnd: "28px",
    },
    optionSubtitle: {
      width: "100%",
      fontSize: "11px",
      fontWeight: 400,
      color: colors.hint,
    },
    optionHelperText: (color: string = colors.hint) => ({
      color,
      width: "100%",
      fontWeight: 400,
      fontSize: "11px",
    }),
    optionCheck: {
      top: "50%",
      fontSize: "18px",
      position: "absolute",
      color: colors.accent,
      insetInlineEnd: "16px",
      transform: "translateY(-50%)",
    },
    statusRow: {
      ...optionRow,
      alignItems: "flex-start",
      color: colors.placeholder,
    },
    loadingRow: {
      gap: "10px",
      flexDirection: "row",
      alignItems: "center",
    },
    spinner: {
      flex: "none",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      borderTopColor: colors.accent,
      border: `2px solid ${alpha(colors.accent, 0.25)}`,
      animation: `${ANIMATIONS.SPIN} ${MOTION.SPIN_MS}ms linear infinite`,
    },
  });
