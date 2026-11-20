import type { FC } from "react";
import styles from "../quotation.module.css";
import { Box, type SelectChangeEvent } from "@mui/material";
import SelectField from "../../../components/SelectField/SelectField";

interface IQuotationSelectProps {
  label: string;
  value: string;
  caption?: string;
  disabled?: boolean;
  items: { value: string; label: string }[];
  onChange: (event: SelectChangeEvent<string>) => void;
}
const QuotationSelect: FC<IQuotationSelectProps> = ({
  label,
  caption,
  ...props
}: IQuotationSelectProps) => {
  const text = caption ?? label;
  return (
    <Box className={styles.label}>
      <Box component="span" className={styles.labelText}>
        {text}
      </Box>
      <SelectField {...props} compact ariaLabel={label} />
    </Box>
  );
};
export default QuotationSelect;
