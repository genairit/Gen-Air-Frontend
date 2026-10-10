import {
  FIELD_TYPES,
  type TFieldType,
  LTR_FIELD_TYPES,
  KEYBOARD_TYPE_MAP,
  ALLOWED_FIELD_TYPES,
} from "./constants/textfield.constants";

import Icon from "../Icon/Icon";
import { useStyles } from "./TextField.style";
import CharCounterAdornment from "./CharCounter";
import FieldLabel from "../FieldLabel/FieldLabel";
import { safeAssign } from "../../utilities/object.utility";
import { getHelperText } from "../../utilities/textfield.utility";
import type { IconNameType } from "../../constants/icon.constant";
import { validateInput } from "../../utilities/validation.utility";
import { type ChangeEvent, type FC, useEffect, type ReactNode } from "react";
import { type TextFieldProps, TextField as MuiTextField } from "@mui/material";
import { type IValidationResult } from "../../interfaces/validation-result.interface";

export type TTextfieldProps = Omit<TextFieldProps, "onChange" | "title"> & {
  value: string;
  title?: string;
  type: TFieldType;
  infoText?: string;
  readonly?: boolean;
  titleHint?: string;
  maxLength?: number;
  isRequired?: boolean;
  warningText?: string;
  titleAction?: ReactNode;
  startIcon?: IconNameType;
  showCharCounter?: boolean;
  endAdornment?: ReactNode;
  setIsValid?: (isValid: boolean) => void;
  validator?: (value: string) => IValidationResult;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
};

const TextField: FC<TTextfieldProps> = ({
  type,
  value,
  style,
  title,
  infoText,
  readonly,
  onChange,
  maxLength,
  validator,
  titleHint,
  setIsValid,
  isRequired,
  warningText,
  startIcon,
  titleAction,
  endAdornment,
  placeholder = "",
  disabled = false,
  multiline = false,
  showCharCounter = false,
  ...rest
}) => {
  if (!ALLOWED_FIELD_TYPES.includes(type)) {
    throw new Error(`Invalid field type: ${type}`);
  }

  const inputType = KEYBOARD_TYPE_MAP[type];
  const isLtr = LTR_FIELD_TYPES.includes(type);
  const { isValid, errorText } = validateInput(value, type, validator);
  const helperText = getHelperText({ errorText, warningText, infoText });

  const styles = useStyles({
    disabled,
    hasError: Boolean(errorText),
    isMultiline: Boolean(multiline),
    helperTextColor: helperText.color,
    isLtr,
    isPassword: type === FIELD_TYPES.PASSWORD,
  });

  const counterAdornment = <CharCounterAdornment input={value} maxLength={maxLength} />;

  const props = safeAssign(rest, {
    slotProps: {
      htmlInput: {
        maxLength,
        dir: isLtr ? "ltr" : "rtl",
      },
      input: {
        startAdornment: startIcon && <Icon name={startIcon} />,
        endAdornment: showCharCounter ? counterAdornment : endAdornment,
      },
    },
  });

  useEffect(() => {
    setIsValid?.(isValid);
  }, [isValid, setIsValid]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readonly || disabled) {
      return;
    }

    onChange?.(event.target.value, event);
  };

  return (
    <div style={styles.fieldContainer}>
      {title && (
        <FieldLabel
          title={title}
          hint={titleHint}
          action={titleAction}
          isRequired={isRequired}
          hasError={Boolean(errorText)}
        />
      )}

      <MuiTextField
        {...props}
        fullWidth
        style={style}
        value={value}
        type={inputType}
        variant="outlined"
        disabled={disabled}
        multiline={multiline}
        onChange={handleChange}
        placeholder={placeholder}
        helperText={helperText.text}
        sx={{ ...rest.sx, ...styles.textField }}
      />
    </div>
  );
};

export default TextField;
