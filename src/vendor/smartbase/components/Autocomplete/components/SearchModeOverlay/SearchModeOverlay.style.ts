import {
  AUTOCOMPLETE_TOKENS as TOKENS,
  AUTOCOMPLETE_MOTION as MOTION,
  AUTOCOMPLETE_LAYOUT as LAYOUT,
  AUTOCOMPLETE_ANIMATIONS as ANIMATIONS,
} from "../../../../constants/autocomplete.constant";

import { alpha } from "@mui/material";
import { createStyles } from "../../../../create-styles";
import { getGlassPanel } from "../../utilities/autocomplete-style.utility";
import { type IAutocompleteStyleParams } from "../../../../interfaces/autocomplete.interface";

export const useStyles = ({ colors, hasShadow }: IAutocompleteStyleParams, keyboardInset: number) =>
  createStyles({
    overlay: {
      inset: 0,
      gap: "12px",
      zIndex: 1300,
      display: "flex",
      position: "fixed",
      paddingTop: "58px",
      flexDirection: "column",
      paddingInline: `${LAYOUT.SEARCH_MODE_GUTTER_PX}px`,
      paddingBottom: `${LAYOUT.SEARCH_MODE_GUTTER_PX + keyboardInset}px`,
      "@media (prefers-reduced-motion: reduce)": {
        "& *": { animationDuration: "0.01ms !important", transitionDuration: "0.01ms !important" },
      },
    },
    backdrop: {
      inset: 0,
      position: "absolute",
      backdropFilter: TOKENS.BACKDROP_GLASS,
      WebkitBackdropFilter: TOKENS.BACKDROP_GLASS,
      animation: `${ANIMATIONS.FADE_IN} ${MOTION.BACKDROP_MS}ms ease`,
      backgroundColor: alpha(TOKENS.BACKGROUND, 0.46),
    },
    top: {
      display: "flex",
      position: "relative",
      flexDirection: "column",
      animation: `${ANIMATIONS.SEARCH_TOP_ENTER} ${MOTION.SEARCH_TOP_ENTER_MS}ms ${TOKENS.EASE_OUT}`,
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 600,
      lineHeight: 1.25,
      textAlign: "start",
      color: colors.label,
      marginBottom: "8px",
      marginInlineStart: "6px",
      fontFamily: TOKENS.FONT_FAMILY,
    },
    row: {
      gap: "10px",
      display: "flex",
      alignItems: "center",
    },
    cancelButton: {
      fontSize: "16px",
      fontWeight: 600,
      flex: "0 0 auto",
      padding: "6px 2px",
      color: colors.accent,
      fontFamily: TOKENS.FONT_FAMILY,
    },
    results: {
      minHeight: 0,
      display: "flex",
      flex: "0 1 auto",
      position: "relative",
      borderRadius: "20px",
      flexDirection: "column",
      animation: `${ANIMATIONS.SEARCH_RESULTS_ENTER} ${MOTION.SEARCH_RESULTS_ENTER_MS}ms ${TOKENS.EASE_OUT} ${MOTION.SEARCH_RESULTS_DELAY_MS}ms both`,
      "& [role='listbox']": { flex: "1 1 auto", minHeight: 0, maxHeight: "none" },
      "& [role='option']": {
        fontSize: "15px",
        minHeight: "50px",
        paddingInline: "18px",
        backgroundColor: "transparent",
      },
      ...getGlassPanel(hasShadow),
    },
    overlayExit: {
      pointerEvents: "none",
    },
    backdropExit: {
      animation: `${ANIMATIONS.FADE_OUT} ${MOTION.BACKDROP_MS}ms ease forwards`,
    },
    topExit: {
      animation: `${ANIMATIONS.SEARCH_TOP_EXIT} ${MOTION.SEARCH_EXIT_MS}ms ${TOKENS.EASE_OUT} forwards`,
    },
    resultsExit: {
      animation: `${ANIMATIONS.SEARCH_RESULTS_EXIT} ${MOTION.SEARCH_EXIT_MS}ms ${TOKENS.EASE_OUT} forwards`,
    },
  });
