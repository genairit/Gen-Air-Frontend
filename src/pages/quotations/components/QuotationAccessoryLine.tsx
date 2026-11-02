import type { FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { EQUIPMENT_ROLE } from "../../../constants/quotation.constant";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";

interface IQuotationAccessoryLineProps {
  disabled: boolean;
  line: IQuotationLine;
  onRemove: () => void;
  onChange: (line: IQuotationLine) => void;
}
const QuotationAccessoryLine: FC<IQuotationAccessoryLineProps> = ({
  line,
  disabled,
  onChange,
  onRemove,
}) => {
  const pipe = line.equipmentRole === EQUIPMENT_ROLE.PIPE;
  const title = pipe ? "צנרת" : "חנוכיות";
  const quantityLabel = pipe ? "מטרים" : "כמות";
  const priceLabel = pipe ? "מחיר למטר" : "מחיר";
  const hint = pipe ? "סה״כ מטרים למערכת" : "פריט מתוך המחירון";
  const amount = quotationLineMoney(line);
  return (
    <div data-role={line.equipmentRole} className={styles.accessoryLine}>
      <div className={styles.accessoryTitle}>
        <b>{title}</b>
        <span className={styles.muted}>{hint}</span>
      </div>
      <div className={styles.accessoryDescription}>
        <QuotationInput
          caption="פריט"
          maxLength={1000}
          disabled={disabled}
          label="תיאור בהצעה"
          value={line.description}
          onChange={event => onChange({ ...line, description: event.target.value })}
        />
        <span className={styles.lineIdentity}>{line.sku}</span>
      </div>
      <div className={styles.lineQuantity}>
        <QuotationDecimalInput
          min="0.0001"
          type="number"
          step="0.0001"
          disabled={disabled}
          value={line.quantity}
          caption={quantityLabel}
          label={`כמות (${line.unit})`}
          onChange={event => onChange({ ...line, quantity: event.target.value })}
        />
      </div>
      <div className={styles.linePrice}>
        <QuotationDecimalInput
          min="0"
          type="number"
          step="0.0001"
          disabled={disabled}
          label="מחיר ליחידה"
          caption={priceLabel}
          value={line.quotedPrice}
          onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
        />
      </div>
      <b className={styles.lineTotal}>{amount}</b>
      {!disabled && (
        <button
          title="הסר שורה"
          onClick={onRemove}
          aria-label="הסר שורה"
          className={styles.removeLine}
        >
          ×
        </button>
      )}
    </div>
  );
};
export default QuotationAccessoryLine;
