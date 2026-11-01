import type { FC } from "react";
import { useState } from "react";
import QuotationLine from "./QuotationLine";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import QuotationCataloguePicker from "./QuotationCataloguePicker";
import { QUOTATION_SYSTEM_LABELS } from "../../../constants/quotation.constant";
import type { IQuotationSection } from "../../../interfaces/quotation.interface";
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
  const [confirm, setConfirm] = useState(false);
  return (
    <Card>
      <div className={styles.between}>
        <span className={styles.badge}>{QUOTATION_SYSTEM_LABELS[section.systemType]}</span>
        {!disabled && (
          <div className={styles.row}>
            <Button text="הזז למעלה" onClick={() => onMove(-1)} />
            <Button text="הזז למטה" onClick={() => onMove(1)} />
            <Button text="מחיקת מערכת" onClick={() => setConfirm(true)} />
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
      <QuotationInput
        maxLength={200}
        disabled={disabled}
        value={section.title}
        label="כותרת מערכת / קומה"
        onChange={event => onChange({ ...section, title: event.target.value })}
      />
      {!section.items.length && <p className={styles.muted}>אין עדיין פריטים במערכת</p>}
      {section.items.map(line => (
        <QuotationLine
          line={line}
          key={line.id}
          disabled={disabled}
          items={section.items}
          onChange={next => onChange(updateQuotationLine(section, next))}
          onRemove={() => onChange(removeQuotationLine(section, line.id))}
        />
      ))}
      {!disabled && (
        <QuotationCataloguePicker
          brand={brand}
          section={section}
          onSelect={line => onChange({ ...section, items: [...section.items, line] })}
        />
      )}
    </Card>
  );
};
export default QuotationSection;
