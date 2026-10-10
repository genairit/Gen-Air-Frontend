import type { Theme } from "@mui/material";
import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius, controlHeight } = theme;

const getFieldShadow = ({ disabled = false, isAutocomplete = true }) => {
  if (disabled) {
    return softShadow.insetDisabled;
  }

  if (isAutocomplete) {
    return softShadow.insetField;
  }

  return softShadow.raisedMedium;
};

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    textfield: ({ disabled = false, isAutocomplete = true }) => ({
      width: "100%",
      "& .MuiOutlinedInput-root": {
        gap: "10px",
        borderRadius: radius.pill,
        height: controlHeight.large,
        padding: "0 48px 0 22px",
        backgroundColor: palette.iceWhite,
        boxShadow: getFieldShadow({ disabled, isAutocomplete }),
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "& .MuiOutlinedInput-input": {
        fontSize: 15,
        fontWeight: isAutocomplete ? 400 : 600,
        color: disabled ? palette.disabledText : palette.charcoal,
        ...(isAutocomplete === false && {
          cursor: "pointer",
          caretColor: "transparent",
        }),
      },
      "& input::placeholder": {
        opacity: 1,
        fontSize: 15,
        color: palette.placeholder,
      },
    }),
    iconContainer: ({ disabled = false }) => ({
      top: "50%",
      right: "16px",
      display: "flex",
      position: "absolute",
      alignItems: "center",
      transform: "translateY(-50%)",
      pointerEvents: disabled ? "none" : "auto",
    }),
    icon: ({ disabled = false }) => ({
      fontSize: "30px",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      color: disabled ? palette.disabledText : "inherit",
    }),
    spotlightTextfield: {
      top: 30,
      width: "90%",
      position: "absolute",
    },
    menuContainer: {
      marginTop: "12px",
      overflow: "hidden",
      borderRadius: radius.panel,
      boxShadow: softShadow.raised,
      backgroundColor: palette.iceWhite,
    },
    menuItem: {
      padding: "8px",
      color: palette.charcoal,
      "& .MuiAutocomplete-option": {
        fontSize: 15,
        minHeight: controlHeight.compact,
        padding: "8px 16px",
        borderRadius: radius.pill,
        "&:hover, &.Mui-focused": {
          backgroundColor: palette.airBlue,
        },
      },
    },
    backdrop: (muiTheme: Theme) => ({
      color: palette.white,
      zIndex: muiTheme.zIndex.modal + 1,
    }),
  });
