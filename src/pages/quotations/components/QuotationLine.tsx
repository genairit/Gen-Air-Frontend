import {
  quotationControlParents,
  reparentQuotationControl,
} from "../../../utilities/quotation.utility";

import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import QuotationDecimalInput from "./QuotationDecimalInput";
import QuotationAccessoryLine from "./QuotationAccessoryLine";
import { EQUIPMENT_ROLE } from "../../../constants/quotation.constant";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_DEFAULTS } from "../../../constants/quotation.constant";
import { QUOTATION_CIRCUITS } from "../../../constants/quotation.constant";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";

interface IQuotationLineProps {
  disabled: boolean;
  children?: ReactNode;
  onRemove: () => void;
  line: IQuotationLine;
  items: IQuotationLine[];
  onChange: (line: IQuotationLine) => void;
}
const QuotationLine: FC<IQuotationLineProps> = ({
  line,
  items,
  disabled,
  onChange,
  onRemove,
  children,
}: IQuotationLineProps) => {
  const isEquipment = [EQUIPMENT_ROLE.INDOOR, EQUIPMENT_ROLE.OUTDOOR].some(
    role => role === line.equipmentRole,
  );
  const isControl = line.equipmentRole === EQUIPMENT_ROLE.CONTROL;
  const parents = quotationControlParents(items, line);
  const amount = quotationLineMoney(line);
  const accessory = [EQUIPMENT_ROLE.PIPE, EQUIPMENT_ROLE.HEADER].some(
    role => role === line.equipmentRole,
  );
  if (accessory) {
    return (
      <QuotationAccessoryLine
        line={line}
        disabled={disabled}
        onChange={onChange}
        onRemove={onRemove}
      />
    );
  }
  return (
    <div className={styles.line} data-role={line.equipmentRole}>
      <div className={styles.lineDescription}>
        <div className={styles.lineIdentity}>
          <span>{line.sku}</span>
          <QuotationInput
            maxLength={1000}
            label="תיאור בהצעה"
            disabled={disabled}
            value={line.description}
            onChange={event => onChange({ ...line, description: event.target.value })}
          />
        </div>
        <div className={styles.lineDetails}>
          {line.capacityBtu !== null && (
            <span className={styles.muted}>BTU · {line.capacityBtu.toLocaleString("he-IL")}</span>
          )}
          {line.includesRemote && <span className={styles.muted}>כולל שלט במחיר היחידה</span>}
          {line.includesThermostat && (
            <span className={styles.muted}>כולל טרמוסטט במחיר היחידה</span>
          )}
        </div>
      </div>
      <div className={styles.lineLocation}>
        <QuotationInput
          label="מיקום"
          maxLength={200}
          disabled={disabled}
          value={line.location}
          placeholder="לדוגמה: חדר שינה"
          caption={isEquipment ? "מיקום היחידה" : "מיקום הפריט"}
          onChange={event => onChange({ ...line, location: event.target.value })}
        />
        {isEquipment && (
          <QuotationSelect
            label="מעגל"
            disabled={disabled}
            value={line.circuit ?? QUOTATION_DEFAULTS.CIRCUIT}
            onChange={event => onChange({ ...line, circuit: event.target.value })}
          >
            {QUOTATION_CIRCUITS.map(circuit => (
              <option key={circuit}>{circuit}</option>
            ))}
          </QuotationSelect>
        )}
      </div>
      <div className={styles.lineQuantity}>
        <QuotationDecimalInput
          min="0.0001"
          type="number"
          step="0.0001"
          disabled={disabled}
          value={line.quantity}
          label={`כמות (${line.unit})`}
          onChange={event => onChange({ ...line, quantity: event.target.value })}
        />
        <span className={styles.numericCaption}>כמות</span>
      </div>
      <div className={styles.linePrice}>
        <QuotationDecimalInput
          min="0"
          type="number"
          step="0.0001"
          label="מחיר ליחידה"
          disabled={disabled}
          value={line.quotedPrice}
          onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
        />
        <span className={styles.numericCaption}>מחיר ליחידה (בהצעה)</span>
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
      {isControl && (
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
      )}
      {children && <div className={styles.lineControls}>{children}</div>}
    </div>
  );
};
export default QuotationLine;
