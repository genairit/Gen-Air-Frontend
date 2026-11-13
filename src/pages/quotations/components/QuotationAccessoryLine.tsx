import type { FC, Ref } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { Box, IconButton } from "@mui/material";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { EQUIPMENT_ROLE } from "../../../constants/quotation.constant";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";

interface IQuotationAccessoryLineProps {
  disabled: boolean;
  line: IQuotationLine;
  onRemove: () => void;
  quantityRef: Ref<HTMLInputElement>;
  onChange: (line: IQuotationLine) => void;
}
const QuotationAccessoryLine: FC<IQuotationAccessoryLineProps> = ({
  line,
  disabled,
  quantityRef,
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
    <Box component="div" data-role={line.equipmentRole} className={styles.accessoryLine}>
      <Box component="div" className={styles.accessoryTitle}>
        <Box component="b">{title}</Box>
        <Box component="span" className={styles.muted}>
          {hint}
        </Box>
      </Box>
      <Box component="div" className={styles.accessoryDescription}>
        <QuotationInput
          caption="פריט"
          maxLength={1000}
          disabled={disabled}
          label="תיאור בהצעה"
          value={line.description}
          onChange={event => onChange({ ...line, description: event.target.value })}
        />
        <Box component="span" className={styles.lineIdentity}>
          {line.sku}
        </Box>
      </Box>
      <Box component="div" className={styles.lineQuantity}>
        <QuotationDecimalInput
          min="0.0001"
          type="number"
          step="0.0001"
          ref={quantityRef}
          disabled={disabled}
          value={line.quantity}
          caption={quantityLabel}
          label={`כמות (${line.unit})`}
          onChange={event => onChange({ ...line, quantity: event.target.value })}
        />
      </Box>
      <Box component="div" className={styles.linePrice}>
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
    </Box>
  );
};
export default QuotationAccessoryLine;
