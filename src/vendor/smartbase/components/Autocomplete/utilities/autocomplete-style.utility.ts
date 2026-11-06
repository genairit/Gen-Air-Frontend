import { alpha } from "@mui/material";
import { AUTOCOMPLETE_TOKENS as TOKENS } from "../../../constants/autocomplete.constant";

export const getElevation = (hasShadow: boolean) => {
  if (!hasShadow) {
    return { boxShadow: TOKENS.GLASS_RIM_SHADOW, border: `1px solid ${TOKENS.BORDER}` };
  }

  return {
    border: "1px solid transparent",
    boxShadow: `${TOKENS.FLOAT_SHADOW}, ${TOKENS.GLASS_RIM_SHADOW}`,
  };
};

export const getGlassPanel = (hasShadow: boolean) => ({
  overflow: "hidden",
  backdropFilter: TOKENS.PANEL_GLASS,
  WebkitBackdropFilter: TOKENS.PANEL_GLASS,
  backgroundColor: alpha(TOKENS.SURFACE, 0.5),
  ...getElevation(hasShadow),
});
