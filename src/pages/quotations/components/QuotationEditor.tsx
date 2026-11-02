import {
  QUOTATION_BRANDS,
  QUOTATION_STATUS_LABELS,
  QUOTATION_SYSTEM_OPTIONS,
} from "../../../constants/quotation.constant";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { useState } from "react";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationReview from "./QuotationReview";
import QuotationSelect from "./QuotationSelect";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import QuotationSection from "./QuotationSection";
import QuotationSummary from "./QuotationSummary";
import QuotationPayments from "./QuotationPayments";
import QuotationWarnings from "./QuotationWarnings";
import QuotationDiagnostics from "./QuotationDiagnostics";
import QuotationDecimalInput from "./QuotationDecimalInput";
import { ICON_NAMES } from "../../../constants/icon.constant";
import QuotationProjectPicker from "./QuotationProjectPicker";
import QuotationCustomerPicker from "./QuotationCustomerPicker";
import { QUOTATION_STEPS } from "../../../constants/quotation.constant";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { useQuotationEditor } from "../../../hooks/quotation-editor.hook";
import { useQuotationRebrand } from "../../../hooks/quotation-rebrand.hook";
import { quotationSaveLabel } from "../../../utilities/quotation-presentation.utility";
import { quotationOpeningLine } from "../../../utilities/quotation-presentation.utility";
import type { TQuotationStatus, IQuotation } from "../../../interfaces/quotation.interface";
import { useUnsavedChangesNavigation } from "../../../hooks/unsaved-changes-navigation.hook";
import { updateQuotationSection, moveQuotationSection } from "../../../utilities/quotation.utility";

interface IQuotationEditorProps {
  editable: boolean;
  initial: IQuotation;
  canApprove: boolean;
}
const QuotationEditor: FC<IQuotationEditorProps> = ({
  initial,
  editable,
  canApprove,
}: IQuotationEditorProps) => {
  const [editingStatus, setEditingStatus] = useState<TQuotationStatus | null>(null);
  const editor = useQuotationEditor(initial, editable);
  const { quotation, update } = editor;
  const rebrand = useQuotationRebrand({
    quotation,
    blocked: editor.busy || editor.dirty || !editable,
    onChange: update,
  });
  const disabled =
    !editable || editor.busy || rebrand.busy || quotation.status === QUOTATION_STATUS.APPROVED;
  const blocked = editor.busy || editor.dirty || rebrand.busy || editor.error !== null;
  const blocker = useUnsavedChangesNavigation(editor.dirty || editor.busy || rebrand.busy);
  const showSummary =
    quotation.status !== QUOTATION_STATUS.DRAFT && editingStatus !== quotation.status;
  const showEditor = !showSummary;
  const statusText = quotationSaveLabel({
    busy: editor.busy,
    dirty: editor.dirty,
    updatedAt: quotation.updatedAt,
  });
  const systems = QUOTATION_SYSTEM_OPTIONS;
  const openingLine = quotationOpeningLine(quotation);
  const transition = async (status: TQuotationStatus): Promise<void> => {
    const accepted = await editor.transition(status);
    if (accepted) {
      setEditingStatus(null);
    }
  };
  return (
    <main className={styles.page}>
      <Card>
        <div className={styles.between}>
          <div className={styles.row}>
            <h1 className={styles.heading}>{quotation.number}</h1>
            <span className={styles.badge} data-status={quotation.status}>
              {QUOTATION_STATUS_LABELS[quotation.status]}
            </span>
            <div className={styles.row}>
              {QUOTATION_STEPS.map(step => (
                <span
                  key={step.status}
                  className={styles.step}
                  data-active={quotation.status === step.status}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>
          <span aria-live="polite" className={styles.muted}>
            {statusText}
          </span>
        </div>
        {editor.error && (
          <div role="alert" className={styles.error}>
            {editor.error}
            <div className={styles.row}>
              <Button text="נסה לשמור שוב" onClick={editor.retry} />
              <Button text="טען גרסה מהשרת" onClick={editor.reload} />
            </div>
          </div>
        )}
        <div className={styles.metadata}>
          <QuotationCustomerPicker
            disabled={disabled}
            value={quotation.customerId}
            onChange={customerId => {
              if (customerId) {
                update({ ...quotation, customerId, projectId: null });
              }
            }}
          />
          <QuotationProjectPicker
            disabled={disabled}
            value={quotation.projectId}
            customerId={quotation.customerId}
            selectedName={quotation.projectName}
            onChange={projectId => update({ ...quotation, projectId })}
          />
          <QuotationSelect
            label="חברת מיזוג"
            disabled={disabled}
            value={quotation.brand}
            onChange={event => rebrand.request(event.target.value)}
          >
            <option value="">בחרו חברה...</option>
            {QUOTATION_BRANDS.map(brand => (
              <option key={brand}>{brand}</option>
            ))}
          </QuotationSelect>
          <QuotationDecimalInput
            min="0"
            max="100"
            step="0.01"
            type="number"
            label="הנחה %"
            value={quotation.discountPercent}
            disabled={disabled || quotation.targetPretaxAmount !== null}
            onChange={event => update({ ...quotation, discountPercent: event.target.value })}
          />
          <QuotationInput
            type="date"
            label="תאריך"
            disabled={disabled}
            value={quotation.date}
            onChange={event => update({ ...quotation, date: event.target.value })}
          />
        </div>
        <label className={styles.label}>
          הערות פנימיות (לא יופיעו ללקוח)
          <textarea
            maxLength={5000}
            disabled={disabled}
            value={quotation.internalNotes}
            className={`${styles.input} ${styles.text}`}
            onChange={event => update({ ...quotation, internalNotes: event.target.value })}
          />
        </label>
        {openingLine && (
          <div className={styles.openingLine}>
            <span className={styles.muted}>שורת פתיחה בהצעה:</span>
            <span>{openingLine}</span>
          </div>
        )}
        {rebrand.error && (
          <p role="alert" className={styles.error}>
            {rebrand.error}
          </p>
        )}
        {rebrand.pendingBrand !== null && (
          <div className={styles.error}>
            להחליף חברה ולבחור פריטי קטלוג תואמים? המיקומים והכמויות יישמרו. אם חסר פריט תואם, ההצעה
            לא תשתנה.
            <div className={styles.row}>
              <Button
                isLoading={rebrand.busy}
                onClick={rebrand.confirm}
                text="החלף לפריטים תואמים"
                disabled={rebrand.busy || editor.busy || editor.dirty}
              />
              <Button text="ביטול" disabled={rebrand.busy} onClick={rebrand.cancel} />
            </div>
          </div>
        )}
        {disabled && <p className={styles.muted}>ההצעה נעולה לעריכה או שאין הרשאת עדכון.</p>}
      </Card>
      {blocker.state === "blocked" && (
        <Card>
          <p>יש שינויים שטרם נשמרו. הניווט ימשיך לאחר שמירה מוצלחת.</p>
          <Button text="הישאר בהצעה" onClick={() => blocker.reset()} />
          <Button text="עזוב בלי לשמור שינויים" onClick={() => blocker.proceed()} />
        </Card>
      )}
      {showSummary && (
        <QuotationReview
          editable={!disabled}
          quotation={quotation}
          onEdit={() => setEditingStatus(quotation.status)}
          warnings={
            <QuotationWarnings
              quotation={quotation}
              blocked={blocked}
              canApprove={canApprove}
              onAcknowledge={editor.acknowledge}
            />
          }
        />
      )}
      {showEditor && <QuotationDiagnostics quotation={quotation} />}
      {showEditor && (
        <Card>
          <div className={styles.cardTitle}>
            <span aria-hidden="true" className={styles.cardIcon}>
              <Icon name={ICON_NAMES.QUOTE} />
            </span>
            <div>
              <h2>מערכות ושורות</h2>
              <p className={styles.muted}>
                כל שורה נבחרת מהמחירון. מחיר, תיאור ויחידה נשמרים בשורה ולא משתנים עם המחירון
              </p>
            </div>
          </div>
          {quotation.sections.map((section, index) => (
            <QuotationSection
              key={section.id}
              section={section}
              disabled={disabled}
              brand={quotation.brand}
              onChange={next => update(updateQuotationSection(quotation, next))}
              onMove={direction => update(moveQuotationSection(quotation, index, direction))}
              onRemove={() =>
                update({
                  ...quotation,
                  sections: quotation.sections.filter(current => current.id !== section.id),
                })
              }
            />
          ))}
          {!disabled && (
            <div className={styles.systemActions}>
              <span>הוספת מערכת / קומה</span>
              <div className={styles.row}>
                {systems.map(({ value: systemType, label }) => (
                  <Button
                    key={systemType}
                    text={`+ ${label}`}
                    size={BUTTON_SIZES.COMPACT}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() =>
                      update({
                        ...quotation,
                        sections: [
                          ...quotation.sections,
                          { id: crypto.randomUUID(), title: "", systemType, items: [] },
                        ],
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
      {showEditor && (
        <QuotationPayments onChange={update} disabled={disabled} quotation={quotation} />
      )}
      <QuotationSummary
        blocked={blocked}
        onChange={update}
        disabled={disabled}
        quotation={quotation}
        canApprove={canApprove}
        showWarnings={showEditor}
        onTransition={transition}
        onAcknowledge={editor.acknowledge}
      />
    </main>
  );
};
export default QuotationEditor;
