import type { FC } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import Button from "../../../components/Button/Button";
import { QUOTATION_CIRCUITS } from "../../../constants/quotation.constant";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";
import { CONTROL_KIND, EQUIPMENT_ROLE } from "../../../constants/quotation.constant";

interface IQuotationLineProps {
  disabled: boolean;
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
}: IQuotationLineProps) => {
  const isEquipment = [EQUIPMENT_ROLE.INDOOR, EQUIPMENT_ROLE.OUTDOOR].some(
    role => role === line.equipmentRole,
  );
  const isControl = line.equipmentRole === EQUIPMENT_ROLE.CONTROL;
  const parents = items.filter(
    item =>
      item.equipmentRole === EQUIPMENT_ROLE.INDOOR &&
      !(item.includesRemote && line.controlKind === CONTROL_KIND.REMOTE) &&
      !(item.includesThermostat && line.controlKind === CONTROL_KIND.THERMOSTAT),
  );
  return (
    <div className={styles.line}>
      <div className={styles.lineHeading}>
        <b>
          {line.sku} · {line.description}
        </b>
        {!disabled && <Button text="הסר שורה" onClick={onRemove} />}
      </div>
      <QuotationInput
        maxLength={1000}
        label="תיאור בהצעה"
        disabled={disabled}
        value={line.description}
        onChange={event => onChange({ ...line, description: event.target.value })}
      />
      <QuotationInput
        label="מיקום"
        maxLength={200}
        disabled={disabled}
        value={line.location}
        onChange={event => onChange({ ...line, location: event.target.value })}
      />
      <QuotationInput
        min="0.0001"
        type="number"
        step="0.0001"
        disabled={disabled}
        value={line.quantity}
        label={`כמות (${line.unit})`}
        onChange={event => onChange({ ...line, quantity: event.target.value })}
      />
      <QuotationInput
        min="0"
        type="number"
        step="0.0001"
        label="מחיר ליחידה"
        disabled={disabled}
        value={line.quotedPrice}
        onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
      />
      {isEquipment && (
        <QuotationSelect
          label="מעגל"
          disabled={disabled}
          value={line.circuit ?? "A"}
          onChange={event => onChange({ ...line, circuit: event.target.value })}
        >
          {QUOTATION_CIRCUITS.map(circuit => (
            <option key={circuit}>{circuit}</option>
          ))}
        </QuotationSelect>
      )}
      {isControl && (
        <QuotationSelect
          disabled={disabled}
          label="בקר עבור יחידה"
          value={line.parentItemId ?? ""}
          onChange={event =>
            onChange({
              ...line,
              parentItemId: event.target.value || null,
              quantity:
                parents.find(parent => parent.id === event.target.value)?.quantity ?? line.quantity,
            })
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
      {line.includesRemote && <span className={styles.muted}>כולל שלט במחיר היחידה</span>}
      {line.includesThermostat && <span className={styles.muted}>כולל טרמוסטט במחיר היחידה</span>}
    </div>
  );
};
export default QuotationLine;
