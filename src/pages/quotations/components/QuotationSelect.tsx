import type { FC } from "react";
import styles from "../quotation.module.css";
import type { SelectHTMLAttributes, ReactNode } from "react";

interface IQuotationSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}
const QuotationSelect: FC<IQuotationSelectProps> = ({
  label,
  children,
  ...props
}: IQuotationSelectProps) => {
  return (
    <label className={styles.label}>
      {label}
      <select className={styles.select} {...props}>
        {children}
      </select>
    </label>
  );
};
export default QuotationSelect;
