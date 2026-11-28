import { Box } from "@mui/material";
import { useState, type FC } from "react";
import QuotationLine from "./QuotationLine";
import styles from "../quotation-items.module.css";
import QuotationDecimalInput from "./QuotationDecimalInput";
import QuotationLinkedControl from "./QuotationLinkedControl";
import { quotationLineMoney } from "../../../utilities/quotation.utility";
import { useFocusAddedInput } from "../../../hooks/focus-added-input.hook";
import type { IQuotationLine } from "../../../interfaces/quotation.interface";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";

interface IQuotationItemRowProps {
  readOnly: boolean;
  disabled: boolean;
  line: IQuotationLine;
  onRemove: () => void;
  focusQuantity: boolean;
  items: IQuotationLine[];
  onQuantityFocused: () => void;
  onChange: (next: IQuotationLine) => void;
}
const QuotationItemRow: FC<IQuotationItemRowProps> = ({
  line,
  items,
  readOnly,
  disabled,
  focusQuantity,
  onQuantityFocused,
  onRemove,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const quantityRef = useFocusAddedInput(focusQuantity, onQuantityFocused);
  const parent = line.parentItemId ? items.find(item => item.id === line.parentItemId) : null;
  const showFields = !readOnly && !expanded;
  const amount = quotationLineMoney(line);
  const price = `${quotationDecimalInput(line.quotedPrice)} ₪`;
  const unitCount = quotationDecimalInput(line.quantity);
  const label = line.description || line.sku;
  const details = [
    line.location,
    line.circuit && `מעגל ${line.circuit}`,
    parent && `בקר עבור ${parent.location || parent.sku}`,
    line.includesRemote && "כולל שלט",
    line.includesThermostat && "כולל טרמוסטט",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <Box component="tr" className={styles.item} data-role={line.equipmentRole}>
        <Box scope="row" component="th">
          {readOnly ? (
            <Box component="span">{label}</Box>
          ) : (
            <Box
              type="button"
              component="button"
              disabled={disabled}
              aria-expanded={expanded}
              className={styles.itemAction}
              aria-label={`עריכת פריט ${label}`}
              onClick={() => setExpanded(!expanded)}
              aria-controls={`line-details-${line.id}`}
            >
              {label}
              <Box component="span" aria-hidden="true">
                {expanded ? "▴" : "▾"}
              </Box>
            </Box>
          )}
          <Box component="small" className={styles.sku}>
            <Box dir="ltr" component="bdi">
              {line.sku}
            </Box>
          </Box>
          {details && <Box component="small">{details}</Box>}
          {line.capacityBtu && (
            <Box component="small">
              <Box dir="ltr" component="bdi" className={styles.capacity}>
                {line.capacityBtu.toLocaleString("he-IL")} BTU
              </Box>
            </Box>
          )}
        </Box>
        <Box component="td">
          {showFields && !parent ? (
            <QuotationDecimalInput
              caption=""
              min="0.0001"
              type="number"
              step="0.0001"
              ref={quantityRef}
              disabled={disabled}
              value={line.quantity}
              label={`כמות (${line.unit})`}
              onChange={event => onChange({ ...line, quantity: event.target.value })}
            />
          ) : (
            <Box component="bdi">{unitCount}</Box>
          )}
          <Box component="small">{line.unit}</Box>
        </Box>
        <Box component="td">
          {showFields ? (
            <QuotationDecimalInput
              min="0"
              caption=""
              type="number"
              step="0.0001"
              label="מחיר ליחידה"
              disabled={disabled}
              value={line.quotedPrice}
              onChange={event => onChange({ ...line, quotedPrice: event.target.value })}
            />
          ) : (
            <Box component="bdi">{price}</Box>
          )}
        </Box>
        <Box component="td" className={styles.amount}>
          <Box component="bdi">{amount}</Box>
        </Box>
      </Box>
      {!readOnly && expanded && (
        <Box component="tr" className={styles.details} id={`line-details-${line.id}`}>
          <Box colSpan={4} component="td">
            {parent ? (
              <QuotationLinkedControl
                line={line}
                items={items}
                disabled={disabled}
                onRemove={onRemove}
                onChange={onChange}
              />
            ) : (
              <QuotationLine
                line={line}
                items={items}
                disabled={disabled}
                onRemove={onRemove}
                onChange={onChange}
                focusQuantity={false}
                onQuantityFocused={onQuantityFocused}
              />
            )}
          </Box>
        </Box>
      )}
    </>
  );
};
export default QuotationItemRow;
