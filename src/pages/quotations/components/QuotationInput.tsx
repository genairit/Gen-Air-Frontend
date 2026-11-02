import type { FC } from "react";
import styles from "../quotation.module.css";
import Icon from "../../../components/Icon/Icon";
import type { InputHTMLAttributes } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";

interface IQuotationInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  caption?: string;
}
const QuotationInput: FC<IQuotationInputProps> = ({
  label,
  caption,
  type,
  ...props
}: IQuotationInputProps) => {
  const text = caption ?? label;
  const searchable = type === "search";
  const input = <input type={type} aria-label={label} className={styles.input} {...props} />;
  return (
    <label className={styles.label}>
      <span className={styles.labelText}>{text}</span>
      {searchable ? (
        <span className={styles.searchControl}>
          <Icon name={ICON_NAMES.SEARCH} />
          {input}
        </span>
      ) : (
        input
      )}
    </label>
  );
};
export default QuotationInput;
