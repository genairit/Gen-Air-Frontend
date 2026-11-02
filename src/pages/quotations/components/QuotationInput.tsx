import type { FC } from "react";
import styles from "../quotation.module.css";
import type { InputHTMLAttributes } from "react";

interface IQuotationInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const QuotationInput: FC<IQuotationInputProps> = ({ label, ...props }: IQuotationInputProps) => {
  return (
    <label className={styles.label}>
      <span className={styles.labelText}>{label}</span>
      <input aria-label={label} className={styles.input} {...props} />
    </label>
  );
};
export default QuotationInput;
