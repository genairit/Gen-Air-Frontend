import {
  type TFieldCursor,
  type IAutocompleteStyleParams,
} from "../../../../interfaces/autocomplete.interface";

import { alpha } from "@mui/material";
import { createStyles } from "../../../../create-styles";
import { getElevation } from "../../utilities/autocomplete-style.utility";
import { AUTOCOMPLETE_TOKENS as TOKENS } from "../../../../constants/autocomplete.constant";

export const useStyles = ({ colors, hasShadow }: IAutocompleteStyleParams) => {
  const elevation = getElevation(hasShadow);

  return createStyles({
    field: (cursor: TFieldCursor) => ({
      gap: "10px",
      width: "100%",
      display: "flex",
      cursor,
      minHeight: "54px",
      alignItems: "center",
      borderRadius: "999px",
      boxSizing: "border-box",
      paddingInlineEnd: "12px",
      border: elevation.border,
      paddingInlineStart: "17px",
      background: TOKENS.FIELD_FILL,
      backdropFilter: TOKENS.FIELD_GLASS,
      WebkitBackdropFilter: TOKENS.FIELD_GLASS,
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      boxShadow: `${elevation.boxShadow}, ${TOKENS.FIELD_DEPTH_SHADOW}`,
    }),
    startIcon: {
      flex: "0 0 auto",
      fontSize: "22px",
      color: colors.placeholder,
    },
    endIcon: {
      flex: "0 0 auto",
      fontSize: "20px",
      color: colors.placeholder,
    },
    clearIcon: {
      fontSize: "20px",
    },
    clearButton: {
      width: "30px",
      height: "30px",
      flex: "0 0 auto",
      borderRadius: "999px",
      color: colors.placeholder,
      "&:active": { transform: "scale(0.92)" },
      "&:hover": { color: colors.text, backgroundColor: alpha(colors.accent, 0.18) },
      transition: "background-color 0.16s ease, color 0.16s ease, transform 0.16s ease",
    },
  });
};
