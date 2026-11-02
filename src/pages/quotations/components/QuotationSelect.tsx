import type { FC } from "react";
import styles from "../quotation.module.css";
import type { SelectHTMLAttributes, ReactNode } from "react";

interface IQuotationSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
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
  const text = caption ?? label;
  return (
    <label className={styles.label}>
      <span className={styles.labelText}>{text}</span>
      <select aria-label={label} className={styles.select} {...props}>
        {children}
      </select>
    </label>
  );
};
export default QuotationSelect;
