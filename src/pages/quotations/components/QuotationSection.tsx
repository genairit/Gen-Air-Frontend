import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { useState } from "react";
import Button from "./QuotationButton";
import QuotationLine from "./QuotationLine";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { Box, IconButton } from "@mui/material";
import QuotationLinkedControl from "./QuotationLinkedControl";
import QuotationCataloguePicker from "./QuotationCataloguePicker";
import { quotationMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_SYSTEM_LABELS } from "../../../constants/quotation.constant";
import type { IQuotationSection } from "../../../interfaces/quotation.interface";
import { quotationLineGroups } from "../../../utilities/quotation-presentation.utility";
import { quotationSectionAmount } from "../../../utilities/quotation-presentation.utility";
import { updateQuotationLine, removeQuotationLine } from "../../../utilities/quotation.utility";

interface IQuotationSectionProps {
  brand: string;
  disabled: boolean;
  onRemove: () => void;
  section: IQuotationSection;
  onMove: (direction: number) => void;
  onChange: (section: IQuotationSection) => void;
}
const QuotationSection: FC<IQuotationSectionProps> = ({
  section,
  brand,
  disabled,
  onChange,
  onRemove,
  onMove,
}: IQuotationSectionProps) => {
  const groups = quotationLineGroups(section);
  const amount = quotationMoney(quotationSectionAmount(section));
  const [confirm, setConfirm] = useState(false);
  const [addedLineId, setAddedLineId] = useState<string | null>(null);
  return (
    <Box component="section" className={styles.systemSection}>
      <Box component="div" className={styles.sectionHeader}>
        <Box component="span" className={styles.systemBadge}>
          {QUOTATION_SYSTEM_LABELS[section.systemType]}
        </Box>
        <QuotationInput
          maxLength={200}
          disabled={disabled}
          value={section.title}
          label="כותרת מערכת / קומה"
          placeholder="כותרת מערכת / קומה"
          onChange={event => onChange({ ...section, title: event.target.value })}
        />
        <Box component="b">{amount}</Box>
        {!disabled && (
          <Box component="div" className={styles.sectionButtons}>
            <IconButton
              sx={{ p: 0 }}
              title="הזז למעלה"
              aria-label="הזז למעלה"
              onClick={() => onMove(-1)}
            >
              ↑
            </IconButton>
            <IconButton
              sx={{ p: 0 }}
              title="הזז למטה"
              aria-label="הזז למטה"
              onClick={() => onMove(1)}
            >
              ↓
            </IconButton>
            <Button
              text="מחק מקטע"
              ariaLabel="מחיקת מערכת"
              size={BUTTON_SIZES.COMPACT}
              onClick={() => setConfirm(true)}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        )}
      </Box>
      {confirm && (
        <Box component="div" className={styles.error}>
          למחוק את המערכת וכל השורות שלה?
          <Box component="div" className={styles.row}>
            <Button text="אישור מחיקה" onClick={onRemove} />
            <Button text="ביטול" onClick={() => setConfirm(false)} />
          </Box>
        </Box>
      )}
      {!section.items.length && (
        <Box component="p" className={styles.muted}>
          אין עדיין פריטים במערכת
        </Box>
      )}
      {groups.map(({ line, controls }) => (
        <QuotationLine
          line={line}
          key={line.id}
          disabled={disabled}
          items={section.items}
          focusQuantity={line.id === addedLineId}
          onQuantityFocused={() => setAddedLineId(null)}
          onChange={next => onChange(updateQuotationLine(section, next))}
          onRemove={() => onChange(removeQuotationLine(section, line.id))}
        >
          {controls.map(control => (
            <QuotationLinkedControl
              line={control}
              key={control.id}
              disabled={disabled}
              items={section.items}
              onChange={next => onChange(updateQuotationLine(section, next))}
              onRemove={() => onChange(removeQuotationLine(section, control.id))}
            />
          ))}
        </QuotationLine>
      ))}
      {!disabled && (
        <QuotationCataloguePicker
          brand={brand}
          section={section}
          onSelect={line => {
            setAddedLineId(line.id);
            onChange({ ...section, items: [...section.items, line] });
          }}
        />
      )}
    </Box>
  );
};
export default QuotationSection;
