import type { FC } from "react";
import styles from "../quotation.module.css";
import { Box, InputBase, type AutocompleteRenderInputParams } from "@mui/material";

interface IQuotationEntityInputProps {
  label: string;
  placeholder: string;
  params: AutocompleteRenderInputParams;
}
const QuotationEntityInput: FC<IQuotationEntityInputProps> = ({
  label,
  placeholder,
  params: {
    slotProps: {
      htmlInput,
      input: { ref: anchorRef, endAdornment },
    },
  },
}) => {
  const inputProps = {
    ...htmlInput,
    placeholder,
    "aria-label": label,
  };
  return (
    <Box ref={anchorRef} className={styles.entityControl}>
      <InputBase inputProps={inputProps} className={styles.entityInput} />
      {endAdornment}
    </Box>
  );
};
export default QuotationEntityInput;
