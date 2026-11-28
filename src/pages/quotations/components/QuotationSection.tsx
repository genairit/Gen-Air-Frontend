import {
  quotationMoney,
  updateQuotationLine,
  removeQuotationLine,
} from "../../../utilities/quotation.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Button from "./QuotationButton";
import { useState, type FC } from "react";
import QuotationItemRow from "./QuotationItemRow";
import styles from "../quotation-items.module.css";
import QuotationSystemForm from "./QuotationSystemForm";
import QuotationCataloguePicker from "./QuotationCataloguePicker";
import { quotationSectionHeading } from "../../../utilities/quotation-floor.utility";
import { quotationSectionAmount } from "../../../utilities/quotation-presentation.utility";
import type { IQuotation, IQuotationSection } from "../../../interfaces/quotation.interface";

interface IQuotationSectionProps {
  last: boolean;
  first: boolean;
  disabled: boolean;
  readOnly: boolean;
  newSection: boolean;
  onRemove: () => void;
  quotation: IQuotation;
  section: IQuotationSection;
  onMove: (direction: number) => void;
  onEdit: (quotation: IQuotation) => void;
  onChange: (section: IQuotationSection) => void;
}
const QuotationSection: FC<IQuotationSectionProps> = ({
  section,
  quotation,
  newSection,
  disabled,
  readOnly,
  first,
  last,
  onChange,
  onMove,
  onRemove,
  onEdit,
}) => {
  const [configuring, setConfiguring] = useState(false);
  const [adding, setAdding] = useState(newSection);
  const [confirm, setConfirm] = useState(false);
  const [addedLineId, setAddedLineId] = useState<string | null>(null);
  const heading = quotationSectionHeading(section);
  const amount = quotationMoney(quotationSectionAmount(section));
  return (
    <>
      {(heading || !readOnly) && (
        <Box component="tr" className={styles.system}>
          <Box scope="row" colSpan={3} component="th">
            <Box className={styles.headingRow}>
              {heading && <Box component="span">{heading}</Box>}
              {!readOnly && (
                <Box
                  type="button"
                  component="button"
                  disabled={disabled}
                  aria-expanded={configuring}
                  className={styles.textButton}
                  aria-label={`עריכת מערכת ${heading || "כללי"}`}
                  onClick={() => {
                    setConfiguring(!configuring);
                    setConfirm(false);
                  }}
                >
                  עריכה
                </Box>
              )}
            </Box>
          </Box>
          <Box component="td" className={styles.amount}>
            <Box component="bdi">{amount}</Box>
          </Box>
        </Box>
      )}
      {!readOnly && configuring && (
        <Box component="tr">
          <Box colSpan={4} component="td" className={styles.panel}>
            <QuotationSystemForm
              section={section}
              disabled={disabled}
              quotation={quotation}
              onClose={() => setConfiguring(false)}
              onSave={next => {
                onEdit(next);
                setConfiguring(false);
              }}
            />
            <Box className={styles.actions}>
              <Button
                text="הזז למעלה"
                onClick={() => onMove(-1)}
                size={BUTTON_SIZES.COMPACT}
                disabled={disabled || first}
                variant={BUTTON_VARIANTS.NEUTRAL}
              />
              <Button
                text="הזז למטה"
                onClick={() => onMove(1)}
                disabled={disabled || last}
                size={BUTTON_SIZES.COMPACT}
                variant={BUTTON_VARIANTS.NEUTRAL}
              />
              <Button
                text="מחק מקטע"
                disabled={disabled}
                ariaLabel="מחיקת מערכת"
                size={BUTTON_SIZES.COMPACT}
                onClick={() => setConfirm(true)}
                variant={BUTTON_VARIANTS.NEUTRAL}
              />
            </Box>
            {confirm && (
              <Box role="alert" className={styles.confirm}>
                למחוק את המערכת וכל השורות שלה?
                <Button
                  text="אישור מחיקה"
                  onClick={onRemove}
                  disabled={disabled}
                  size={BUTTON_SIZES.COMPACT}
                  variant={BUTTON_VARIANTS.DANGER}
                />
                <Button
                  text="ביטול מחיקה"
                  size={BUTTON_SIZES.COMPACT}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  onClick={() => setConfirm(false)}
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
      {section.items.map(line => (
        <QuotationItemRow
          line={line}
          key={line.id}
          disabled={disabled}
          readOnly={readOnly}
          items={section.items}
          focusQuantity={line.id === addedLineId}
          onQuantityFocused={() => setAddedLineId(null)}
          onChange={next => onChange(updateQuotationLine(section, next))}
          onRemove={() => onChange(removeQuotationLine(section, line.id))}
        />
      ))}
      {!readOnly && (
        <Box component="tr">
          <Box colSpan={4} component="td" className={styles.picker}>
            <Box
              type="button"
              component="button"
              disabled={disabled}
              aria-expanded={adding}
              className={styles.textButton}
              onClick={() => setAdding(!adding)}
            >
              {adding ? "סגירת הקטלוג" : "+ הוסף פריט מהקטלוג"}
            </Box>
            {adding && (
              <Box disabled={disabled} component="fieldset" className={styles.catalogue}>
                <QuotationCataloguePicker
                  section={section}
                  brand={section.brand ?? ""}
                  onSelect={line => {
                    if (disabled) {
                      return;
                    }
                    setAddedLineId(line.id);
                    onChange({ ...section, items: [...section.items, line] });
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};
export default QuotationSection;
