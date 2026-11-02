import {
  AUTOCOMPLETE_TOKENS as TOKENS,
  AUTOCOMPLETE_MOTION as MOTION,
  AUTOCOMPLETE_ANIMATIONS as ANIMATIONS,
} from "../../constants/autocomplete.constant";

import { createStyles } from "../../create-styles";
import { getGlassPanel } from "./utilities/autocomplete-style.utility";
import { type IAutocompleteStyleParams } from "../../interfaces/autocomplete.interface";

export const useStyles = ({ colors, hasShadow }: IAutocompleteStyleParams) =>
  createStyles({
    root: {
      zIndex: 1,
      width: "100%",
      position: "relative",
      "&:focus-within": { zIndex: 80 },
      "@media (prefers-reduced-motion: reduce)": {
        "& *": { animationDuration: "0.01ms !important", transitionDuration: "0.01ms !important" },
      },
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 600,
      lineHeight: 1.25,
      textAlign: "start",
      color: colors.label,
      marginBottom: "8px",
      fontFamily: TOKENS.FONT_FAMILY,
    },
    required: {
      fontStyle: "normal",
      color: colors.required,
      marginInlineStart: "2px",
    },
    input: {
      minWidth: 0,
      fontSize: "16px",
      fontWeight: 500,
      flex: "1 1 auto",
      color: colors.placeholder,
      fontFamily: TOKENS.FONT_FAMILY,
      "& .MuiInputBase-input": {
        padding: 0,
        height: "auto",
        lineHeight: 1.2,
        cursor: "inherit",
        textAlign: "start",
      },
      "& .MuiInputBase-input::placeholder": {
        opacity: 1,
        color: colors.placeholder,
      },
    },
    selectedInput: {
      color: colors.text,
    },
    dropDown: {
      zIndex: 90,
      insetInline: 0,
      position: "absolute",
      borderRadius: "22px",
      top: "calc(100% + 6px)",
      animation: `${ANIMATIONS.DROP_DOWN_ENTER} ${MOTION.DROP_DOWN_MS}ms ${TOKENS.EASE_OUT}`,
      ...getGlassPanel(hasShadow),
    },
    dropDownExit: {
      pointerEvents: "none",
      animation: `${ANIMATIONS.DROP_DOWN_EXIT} ${MOTION.DROP_DOWN_MS}ms ${TOKENS.EASE_OUT} forwards`,
    },
    hint: {
      fontSize: "12px",
      margin: "7px 0 0",
      lineHeight: 1.35,
      color: colors.hint,
      textAlign: "start",
      fontFamily: TOKENS.FONT_FAMILY,
    },
  });
