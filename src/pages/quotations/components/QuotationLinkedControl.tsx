import {
  quotationControlParents,
  reparentQuotationControl,
} from "../../../utilities/quotation.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import QuotationDecimalInput from "./QuotationDecimalInput";
import CheckBox from "../../../components/CheckBox/CheckBox";
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
    <Box className={styles.linkedControl}>
      <Box className={styles.linkedToggle}>
        <CheckBox
          value
          text={kind}
          disabled={disabled}
          onChange={onRemove}
          ariaLabel={`הסר ${kind}`}
        />
      </Box>
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
      <Box component="span" className={styles.muted}>
        {quantity} {line.unit} · {amount}
      </Box>
      <QuotationSelect
        disabled={disabled}
        label="בקר עבור יחידה"
        value={line.parentItemId ?? ""}
        onChange={event =>
          onChange(
            reparentQuotationControl({ line, items, parentItemId: event.target.value || null }),
          )
        }
        items={[
          { value: "", label: "פריט נפרד" },
          ...parents.map(parent => ({ value: parent.id, label: parent.location || parent.sku })),
        ]}
      />
    </Box>
  );
};
export default QuotationLinkedControl;
