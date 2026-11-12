import styles from "../quotation.module.css";
import { useId, type FC, type Ref } from "react";
import Icon from "../../../components/Icon/Icon";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { Box, InputBase, type InputBaseProps } from "@mui/material";

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
  maxLength,
  ...props
}) => {
  const labelId = useId();
  const text = caption ?? label;
  const searchable = type === "search";
  const input = (
    <InputBase
      {...props}
      type={type}
      inputRef={ref}
      className={styles.input}
      slotProps={{
        input: {
          min,
          max,
          step,
          maxLength,
          "aria-label": label,
          ...(caption ? { "aria-describedby": labelId } : {}),
        },
      }}
    />
  );
  return (
    <Box className={styles.label}>
      <Box id={labelId} component="span" className={styles.labelText}>
        {text}
      </Box>
      {searchable ? (
        <Box className={styles.searchControl}>
          <Icon name={ICON_NAMES.SEARCH} />
          {input}
        </Box>
      ) : (
        input
      )}
    </Box>
  );
};
export default QuotationInput;
