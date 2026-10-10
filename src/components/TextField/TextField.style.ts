import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { createFocusRing } from "../../utilities/shadow.utility";

interface IStylesParams {
  isLtr: boolean;
  hasError: boolean;
  disabled: boolean;
  isPassword: boolean;
  isMultiline: boolean;
  helperTextColor: string;
}

const { palette, softShadow, radius, controlHeight } = theme;

const FOCUS_SHADOW = `${softShadow.insetField}, ${createFocusRing(palette.airBlue)}`;
const ERROR_SHADOW = `${softShadow.insetError}, ${createFocusRing(palette.orange)}`;

const getFieldShadow = ({ hasError, disabled }: Pick<IStylesParams, "hasError" | "disabled">) => {
  if (disabled) {
    return softShadow.insetDisabled;
  }

  if (hasError) {
    return ERROR_SHADOW;
  }

  return softShadow.insetField;
};

const getFieldShape = (isMultiline: boolean) => {
  if (isMultiline) {
    return { borderRadius: radius.panel, padding: "18px 22px", alignItems: "flex-start" };
  }

  return { borderRadius: radius.pill, padding: "0 22px", height: controlHeight.large };
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
        transition: "box-shadow 0.2s ease",
        boxShadow: getFieldShadow({ hasError, disabled }),
        backgroundColor: hasError ? palette.errorSurface : palette.iceWhite,

        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },

        "&.Mui-focused": {
          boxShadow: hasError ? ERROR_SHADOW : FOCUS_SHADOW,
        },

        "& input, & textarea": {
          padding: 0,
          fontSize: 15,
          fontWeight: 400,
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
        fontSize: 12,
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
