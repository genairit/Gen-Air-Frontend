import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

interface IStylesParams {
  isLtr: boolean;
  hasError: boolean;
  disabled: boolean;
  isPassword: boolean;
  isMultiline: boolean;
  helperTextColor: string;
}

const { palette, glass, controlHeight } = theme;

const getFieldShape = (isMultiline: boolean) => {
  if (isMultiline) {
    return { borderRadius: "17px", padding: "18px 16px", alignItems: "flex-start" };
  }

  return { borderRadius: "17px", padding: "0 16px", height: controlHeight.large };
};

export const useStyles = ({
  isLtr,
  hasError,
  disabled,
  isPassword,
  isMultiline,
  helperTextColor,
}: IStylesParams) =>
  createStyles({
    textField: {
      "& .MuiOutlinedInput-root": {
        ...getFieldShape(isMultiline),
        gap: "12px",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        border: `1px solid ${hasError ? palette.danger : glass.border}`,
        backgroundColor: disabled ? palette.iceWhite : palette.white,

        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },

        "&.Mui-focused": {
          borderColor: hasError ? palette.danger : palette.primary,
          boxShadow: glass.focus,
        },

        "& input, & textarea": {
          padding: 0,
          fontSize: 16,
          fontWeight: 500,
          textAlign: isLtr ? "end" : "start",
          letterSpacing: isPassword ? "0.2em" : "normal",
          color: disabled ? palette.disabledText : palette.charcoal,
        },

        "& input::placeholder, & textarea::placeholder": {
          opacity: 1,
          letterSpacing: "normal",
          color: palette.placeholder,
        },
      },
      "& .MuiFormHelperText-root": {
        fontSize: 13,
        margin: "10px 0 0",
        color: helperTextColor,
      },
    },
    fieldContainer: {
      gap: "10px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
  });
