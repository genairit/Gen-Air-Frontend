import {
  quotationControlParents,
  reparentQuotationControl,
} from "../../../utilities/quotation.utility";

import type { FC, ReactNode } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import { Box, MenuItem, IconButton } from "@mui/material";
import QuotationDecimalInput from "./QuotationDecimalInput";
import QuotationAccessoryLine from "./QuotationAccessoryLine";
import { EQUIPMENT_ROLE } from "../../../constants/quotation.constant";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import { useFocusAddedInput } from "../../../hooks/focus-added-input.hook";
import { QUOTATION_DEFAULTS } from "../../../constants/quotation.constant";
import { QUOTATION_CIRCUITS } from "../../../constants/quotation.constant";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";

interface IQuotationLineProps {
  disabled: boolean;
  children?: ReactNode;
  onRemove: () => void;
  line: IQuotationLine;
  focusQuantity: boolean;
  items: IQuotationLine[];
  onQuantityFocused: () => void;
  onChange: (line: IQuotationLine) => void;
}
const QuotationLine: FC<IQuotationLineProps> = ({
  line,
  items,
  disabled,
  focusQuantity,
  onChange,
  onRemove,
  children,
  onQuantityFocused,
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
  const quantityRef = useFocusAddedInput(focusQuantity, onQuantityFocused);
  if (accessory) {
    return (
      <QuotationAccessoryLine
        line={line}
        disabled={disabled}
        onChange={onChange}
        onRemove={onRemove}
        quantityRef={quantityRef}
      />
    );
  }
  return (
    <Box component="div" className={styles.line} data-role={line.equipmentRole}>
      <Box component="div" className={styles.lineDescription}>
        <Box component="div" className={styles.lineIdentity}>
          <Box component="span">{line.sku}</Box>
          <QuotationInput
            maxLength={1000}
            label="תיאור בהצעה"
            disabled={disabled}
            value={line.description}
            onChange={event => onChange({ ...line, description: event.target.value })}
          />
        </Box>
        <Box component="div" className={styles.lineDetails}>
          {line.capacityBtu !== null && (
            <Box dir="ltr" component="span" className={styles.btuPair}>
              {line.capacityBtu.toLocaleString("he-IL")} BTU
            </Box>
          )}
          {line.includesRemote && (
            <Box component="span" className={styles.muted}>
              כולל שלט במחיר היחידה
            </Box>
          )}
          {line.includesThermostat && (
            <Box component="span" className={styles.muted}>
              כולל טרמוסטט במחיר היחידה
            </Box>
          )}
        </Box>
      </Box>
      <Box component="div" className={styles.lineLocation}>
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
              <MenuItem key={circuit} value={circuit}>
                {circuit}
              </MenuItem>
            ))}
          </QuotationSelect>
        )}
      </Box>
      <Box component="div" className={styles.lineQuantity}>
        <QuotationDecimalInput
          min="0.0001"
          type="number"
          step="0.0001"
          ref={quantityRef}
          disabled={disabled}
          value={line.quantity}
          label={`כמות (${line.unit})`}
          onChange={event => onChange({ ...line, quantity: event.target.value })}
        />
        <Box component="span" className={styles.numericCaption}>
          כמות
        </Box>
      </Box>
      <Box component="div" className={styles.linePrice}>
        <QuotationDecimalInput
          min="0"
          type="number"
          step="0.0001"
          label="מחיר ליחידה"
          disabled={disabled}
          value={line.quotedPrice}
          onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
        />
        <Box component="span" className={styles.numericCaption}>
          מחיר ליחידה (בהצעה)
        </Box>
      </Box>
      <Box component="b" className={styles.lineTotal}>
        {amount}
      </Box>
      {!disabled && (
        <IconButton
          title="הסר שורה"
          onClick={onRemove}
          aria-label="הסר שורה"
          className={styles.removeLine}
        >
          ×
        </IconButton>
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
          <MenuItem value="">פריט נפרד</MenuItem>
          {parents.map(parent => (
            <MenuItem key={parent.id} value={parent.id}>
              {parent.location || parent.sku}
            </MenuItem>
          ))}
        </QuotationSelect>
      )}
      {children && (
        <Box component="div" className={styles.lineControls}>
          {children}
        </Box>
      )}
    </Box>
  );
};
export default QuotationLine;
