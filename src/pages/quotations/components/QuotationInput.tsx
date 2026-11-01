import type { FC } from "react";
import styles from "../quotation.module.css";
import type { InputHTMLAttributes } from "react";

interface IQuotationInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const QuotationInput: FC<IQuotationInputProps> = ({ label, ...props }: IQuotationInputProps) => {
  return (
    <label className={styles.label}>
      {label}
      <input className={styles.input} {...props} />
    </label>
  );
};
export default QuotationInput;
