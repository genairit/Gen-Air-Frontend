import { useId, type FC } from "react";
import type { ReactNode } from "react";
import styles from "../quotation.module.css";
import { Box, Select, type SelectProps } from "@mui/material";

interface IQuotationSelectProps extends Pick<
  SelectProps<string>,
  "disabled" | "onChange" | "value"
> {
  label: string;
  caption?: string;
  children: ReactNode;
}
const QuotationSelect: FC<IQuotationSelectProps> = ({
  label,
  caption,
  children,
  ...props
}: IQuotationSelectProps) => {
  const labelId = useId();
  const text = caption ?? label;
  return (
    <Box className={styles.label}>
      <Box id={labelId} component="span" className={styles.labelText}>
        {text}
      </Box>
      <Select
        {...props}
        displayEmpty
        disableUnderline
        variant="standard"
        className={styles.select}
        inputProps={{ "aria-label": label, ...(caption ? { "aria-describedby": labelId } : {}) }}
      >
        {children}
      </Select>
    </Box>
  );
};
export default QuotationSelect;
