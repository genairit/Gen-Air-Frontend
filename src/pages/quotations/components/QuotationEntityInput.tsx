import type { FC } from "react";
import styles from "../quotation.module.css";
import type { AutocompleteRenderInputParams } from "@mui/material";

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
    className: styles.entityInput,
  };
  return (
    <div ref={anchorRef} className={styles.entityControl}>
      <input {...inputProps} />
      {endAdornment}
    </div>
  );
};
export default QuotationEntityInput;
