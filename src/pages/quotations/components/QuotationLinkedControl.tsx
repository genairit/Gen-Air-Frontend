import {
  quotationControlParents,
  reparentQuotationControl,
} from "../../../utilities/quotation.utility";

import type { FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { CONTROL_KIND } from "../../../constants/quotation.constant";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";

interface IQuotationLinkedControlProps {
  disabled: boolean;
  onRemove: () => void;
  line: IQuotationLine;
  items: IQuotationLine[];
  onChange: (line: IQuotationLine) => void;
}
const QuotationLinkedControl: FC<IQuotationLinkedControlProps> = ({
  line,
  items,
  disabled,
  onChange,
  onRemove,
}) => {
  const kind = line.controlKind === CONTROL_KIND.REMOTE ? "שלט" : "טרמוסטט";
  const amount = quotationLineMoney(line);
  const quantity = quotationDecimalInput(line.quantity);
  const parents = quotationControlParents(items, line);

  return (
    <div className={styles.linkedControl}>
      <label className={styles.linkedToggle}>
        <input
          checked
          type="checkbox"
          disabled={disabled}
          onChange={onRemove}
          aria-label={`הסר ${kind}`}
        />
        {kind}
      </label>
      <QuotationInput
        maxLength={1000}
        disabled={disabled}
        label="תיאור בקר בהצעה"
        value={line.description}
        onChange={event => onChange({ ...line, description: event.target.value })}
      />
      <QuotationDecimalInput
        min="0"
        step="0.0001"
        type="number"
        disabled={disabled}
        label="מחיר בקר ליחידה"
        value={line.quotedPrice}
        onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
      />
      <span className={styles.muted}>
        {quantity} {line.unit} · {amount}
      </span>
      <QuotationSelect
        disabled={disabled}
        label="בקר עבור יחידה"
        value={line.parentItemId ?? ""}
        onChange={event =>
          onChange(
            reparentQuotationControl({ line, items, parentItemId: event.target.value || null }),
          )
        }
      >
        <option value="">פריט נפרד</option>
        {parents.map(parent => (
          <option key={parent.id} value={parent.id}>
            {parent.location || parent.sku}
          </option>
        ))}
      </QuotationSelect>
    </div>
  );
};
export default QuotationLinkedControl;
