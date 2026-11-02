import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { useState } from "react";
import QuotationLine from "./QuotationLine";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import Button from "../../../components/Button/Button";
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
  return (
    <section className={styles.systemSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.systemBadge}>{QUOTATION_SYSTEM_LABELS[section.systemType]}</span>
        <QuotationInput
          maxLength={200}
          disabled={disabled}
          value={section.title}
          label="כותרת מערכת / קומה"
          placeholder="כותרת מערכת / קומה"
          onChange={event => onChange({ ...section, title: event.target.value })}
        />
        <b>{amount}</b>
        {!disabled && (
          <div className={styles.sectionButtons}>
            <button
              type="button"
              title="הזז למעלה"
              aria-label="הזז למעלה"
              onClick={() => onMove(-1)}
            >
              ↑
            </button>
            <button type="button" title="הזז למטה" aria-label="הזז למטה" onClick={() => onMove(1)}>
              ↓
            </button>
            <Button
              text="מחיקת מערכת"
              size={BUTTON_SIZES.COMPACT}
              onClick={() => setConfirm(true)}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </div>
        )}
      </div>
      {confirm && (
        <div className={styles.error}>
          למחוק את המערכת וכל השורות שלה?
          <div className={styles.row}>
            <Button text="אישור מחיקה" onClick={onRemove} />
            <Button text="ביטול" onClick={() => setConfirm(false)} />
          </div>
        </div>
      )}
      {!section.items.length && <p className={styles.muted}>אין עדיין פריטים במערכת</p>}
      {groups.map(({ line, controls }) => (
        <QuotationLine
          line={line}
          key={line.id}
          disabled={disabled}
          items={section.items}
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
          onSelect={line => onChange({ ...section, items: [...section.items, line] })}
        />
      )}
    </section>
  );
};
export default QuotationSection;
