import styles from "../quotation.module.css";
import { useId, type FC, type Ref } from "react";
import { Box, type InputBaseProps } from "@mui/material";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators/free-text.validator";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IQuotationInputProps extends Pick<
  InputBaseProps,
  "autoFocus" | "disabled" | "onBlur" | "onChange" | "onFocus" | "placeholder"
> {
  min?: string;
  max?: string;
  label: string;
  value: string;
  step?: string;
  caption?: string;
  maxLength?: number;
  ref?: Ref<HTMLInputElement>;
  type?: "date" | "number" | "search";
}

const QuotationInput: FC<IQuotationInputProps> = ({
  label,
  caption,
  type,
  ref,
  min,
  max,
  step,
  value,
  onChange,
  maxLength,
  ...props
}) => {
  const labelId = useId();
  const fieldType = type ?? FIELD_TYPES.TEXT;
  const startIcon = type === FIELD_TYPES.SEARCH ? ICON_NAMES.SEARCH : null;

  return (
    <Box className={styles.label}>
      <Box id={labelId} component="span" className={styles.labelText}>
        {caption ?? label}
      </Box>
      <TextField
        {...props}
        compact
        value={value}
        inputRef={ref}
        type={fieldType}
        maxLength={maxLength}
        startIcon={startIcon}
        validator={validateFreeText}
        onChange={(_text, event) => onChange?.(event)}
        isLtr={type === FIELD_TYPES.DATE || type === FIELD_TYPES.NUMBER}
        slotProps={{
          htmlInput: { min, max, step, "aria-label": label, "aria-describedby": labelId },
        }}
      />
    </Box>
  );
};

export default QuotationInput;
