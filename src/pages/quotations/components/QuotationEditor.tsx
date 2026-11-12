import {
  addQuotationBrand,
  quotationBrandTabs,
  moveQuotationSection,
  updateQuotationSection,
  removeEmptyQuotationBrand,
} from "../../../utilities/quotation.utility";

import {
  QUOTATION_BRANDS,
  QUOTATION_SYSTEM,
  QUOTATION_CONFIRMATION,
  QUOTATION_STATUS_LABELS,
  QUOTATION_SYSTEM_OPTIONS,
  QUOTATION_GENERAL_TAB_ID,
  MAX_QUOTATION_CANCELLATION_REASON_LENGTH,
} from "../../../constants/quotation.constant";

import type {
  IQuotation,
  TQuotationStatus,
  TQuotationConfirmation,
} from "../../../interfaces/quotation.interface";

import {
  quotationCancellationNoun,
  quotationCancellationView,
  quotationCancellationTimeline,
} from "../../../utilities/quotation-cancellation.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { useState } from "react";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { useNavigate } from "react-router-dom";
import QuotationReview from "./QuotationReview";
import QuotationSelect from "./QuotationSelect";
import QuotationDelete from "./QuotationDelete";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import Tabs from "../../../components/Tabs/Tabs";
import QuotationSection from "./QuotationSection";
import QuotationSummary from "./QuotationSummary";
import QuotationPayments from "./QuotationPayments";
import QuotationWarnings from "./QuotationWarnings";
import QuotationDiagnostics from "./QuotationDiagnostics";
import QuotationDecimalInput from "./QuotationDecimalInput";
import Timeline from "../../../components/Timeline/Timeline";
import { ICON_NAMES } from "../../../constants/icon.constant";
import QuotationProjectPicker from "./QuotationProjectPicker";
import TextField from "../../../components/TextField/TextField";
import QuotationCustomerPicker from "./QuotationCustomerPicker";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import QuotationSalesAgentPicker from "./QuotationSalesAgentPicker";
import { useQuotationPdf } from "../../../hooks/quotation-pdf.hook";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import { QUOTATION_STEPS } from "../../../constants/quotation.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { useQuotationEditor } from "../../../hooks/quotation-editor.hook";
import { useQuotationRebrand } from "../../../hooks/quotation-rebrand.hook";
import { TAB_MODES, TABS_VARIANTS } from "../../../constants/tabs.constant";
import QuotationApartmentSharingCard from "./sharing/QuotationApartmentSharingCard";
import { QUOTATION_SHARING_COPY } from "../../../constants/quotation-sharing.constant";
import { quotationSaveLabel } from "../../../utilities/quotation-presentation.utility";
import { quotationOpeningLine } from "../../../utilities/quotation-presentation.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { Box, MenuItem, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useUnsavedChangesNavigation } from "../../../hooks/unsaved-changes-navigation.hook";
import { useQuotationApartmentSharing } from "../../../hooks/quotation-apartment-sharing.hook";
import { useQuotationDeletedNavigation } from "../../../hooks/quotation-deleted-navigation.hook";

interface IQuotationEditorProps {
  editable: boolean;
  canExport: boolean;
  canClone?: boolean;
  initial: IQuotation;
  canApprove: boolean;
  canDelete?: boolean;
  canCancel?: boolean;
  canRestore?: boolean;
}
const QuotationEditor: FC<IQuotationEditorProps> = ({
  initial,
  editable,
  canApprove,
  canExport,
  canCancel = false,
  canRestore = false,
  canDelete = false,
  canClone = false,
}: IQuotationEditorProps) => {
  const navigate = useNavigate();
  const [editingStatus, setEditingStatus] = useState<TQuotationStatus | null>(null);
  const [confirmation, setConfirmation] = useState<TQuotationConfirmation | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [latestLoadedAfterConflict, setLatestLoadedAfterConflict] = useState(false);
  const [activeTab, setActiveTab] = useState(initial.brands[0] ?? QUOTATION_GENERAL_TAB_ID);
  const editor = useQuotationEditor(initial, editable, canDelete);
  const { quotation, update } = editor;
  const pdfTitle = quotation.status === QUOTATION_STATUS.APPROVED ? "הזמנה" : "הצעת מחיר";
  const pdf = useQuotationPdf(quotation.id, `${pdfTitle} ${quotation.number}.pdf`);
  const sharing = useQuotationApartmentSharing({
    quotation,
    canEdit: editable,
    busy: editor.commandBusy,
  });
  const rebrand = useQuotationRebrand({
    quotation,
    blocked: editor.commandBusy || !editable,
    confirmBlocked: editor.busy || editor.dirty,
    onChange: update,
  });
  const disabled =
    !editable ||
    editor.commandBusy ||
    rebrand.busy ||
    quotation.status === QUOTATION_STATUS.APPROVED ||
    quotation.status === QUOTATION_STATUS.CANCELLED;
  const blocked = editor.busy || editor.dirty || rebrand.busy || editor.error !== null;
  const navigationPending = !editor.deleted && (editor.dirty || editor.busy || rebrand.busy);
  const blocker = useUnsavedChangesNavigation(navigationPending);
  useQuotationDeletedNavigation(editor.deleted, quotation.id);
  const isSummaryVisible =
    quotation.status !== QUOTATION_STATUS.DRAFT && editingStatus !== quotation.status;
  const isEditorVisible = !isSummaryVisible;
  const statusText = quotationSaveLabel({
    busy: editor.busy,
    dirty: editor.dirty,
    updatedAt: quotation.updatedAt,
  });
  const contextLockedReason = sharing.hasLinks ? QUOTATION_SHARING_COPY.CONTEXT_LOCKED : null;
  const systems = QUOTATION_SYSTEM_OPTIONS;
  const brandTabs = quotationBrandTabs(quotation, activeTab);
  const openingLine = quotationOpeningLine(quotation);
  const cancellationEntries = quotationCancellationTimeline(quotation.cancellationHistory);
  const cancellationNoun = quotationCancellationNoun(quotation);
  const canCancelQuotation = canCancel && quotation.status !== QUOTATION_STATUS.CANCELLED;
  const canRestoreQuotation = canRestore && quotation.status === QUOTATION_STATUS.CANCELLED;
  const confirmationView =
    confirmation === null ? null : quotationCancellationView(quotation, confirmation);
  const isConfirmationOpen = confirmationView !== null;
  const confirmationTitle = confirmationView?.title ?? "";
  const confirmationActionLabel = confirmationView?.actionLabel ?? "";
  const confirmationDescription = confirmationView?.description ?? "";
  const showConfirmationError = isConfirmationOpen && editor.error !== null;
  const requestedActionAvailable =
    confirmation === QUOTATION_CONFIRMATION.CANCEL ? canCancelQuotation : canRestoreQuotation;
  const confirmationActions: Record<TQuotationConfirmation, () => Promise<boolean>> = {
    [QUOTATION_CONFIRMATION.CANCEL]: () => editor.cancel(cancellationReason),
    [QUOTATION_CONFIRMATION.RESTORE]: editor.restore,
  };
  const confirmQuotationAction = async (): Promise<void> => {
    if (confirmation === null) {
      return;
    }

    const accepted = await confirmationActions[confirmation]();
    if (!accepted) {
      return;
    }

    setConfirmation(null);
    setCancellationReason("");
    setLatestLoadedAfterConflict(false);
    setEditingStatus(null);
  };
  const reloadConflict = async (): Promise<void> => {
    const loaded = await editor.reload();
    if (loaded) {
      setLatestLoadedAfterConflict(true);
    }
  };
  const reloadQuotation = async (): Promise<void> => {
    await editor.reload();
  };
  const transition = async (status: TQuotationStatus): Promise<void> => {
    const accepted = await editor.transition(status);
    if (accepted) {
      setEditingStatus(null);
    }
  };
  const changeSalesAgent = async (salesAgentId: string | null): Promise<void> => {
    if (quotation.status === QUOTATION_STATUS.APPROVED) {
      await editor.updateSalesAgent(salesAgentId);
      return;
    }

    update({ ...quotation, salesAgentId });
  };
  return (
    <Box component="main" className={styles.page}>
      <Card>
        <Box component="div" className={styles.quotationHeader}>
          <Box component="div" className={styles.quotationHeaderTop}>
            <Box component="div" className={styles.quotationIdentity}>
              <Box component="h1" className={styles.heading}>
                {quotation.number}
              </Box>
              <Box component="span" className={styles.badge} data-status={quotation.status}>
                {QUOTATION_STATUS_LABELS[quotation.status]}
              </Box>
            </Box>
            <Box component="div" className={styles.quotationActions}>
              {canClone &&
                quotation.brands.length === 1 &&
                quotation.sections.some(section => section.brand === quotation.brands[0]) && (
                  <Button
                    disabled={blocked}
                    text="צור העתק לחברה אחרת"
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() => navigate(`${ROUTE_PATHS.QUOTATIONS}?cloneFrom=${quotation.id}`)}
                  />
                )}
              {canExport && (
                <Button
                  onClick={pdf.download}
                  disabled={blocked || pdf.busy}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  text={pdf.busy ? "מכין PDF..." : "ייצוא PDF"}
                />
              )}
              {canCancelQuotation && (
                <Button
                  disabled={blocked}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  text={`ביטול ${cancellationNoun}`}
                  onClick={() => setConfirmation(QUOTATION_CONFIRMATION.CANCEL)}
                />
              )}
              {canRestoreQuotation && (
                <Button
                  disabled={blocked}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  text={`שחזור ${cancellationNoun}`}
                  onClick={() => setConfirmation(QUOTATION_CONFIRMATION.RESTORE)}
                />
              )}
            </Box>
          </Box>
          <Box component="div" className={styles.quotationStatusSteps}>
            {QUOTATION_STEPS.map(step => (
              <Box
                component="span"
                key={step.status}
                className={styles.step}
                data-active={quotation.status === step.status}
              >
                {step.label}
              </Box>
            ))}
          </Box>
          <Box component="span" aria-live="polite" className={styles.muted}>
            {statusText}
          </Box>
        </Box>
        {cancellationEntries.length > 0 && (
          <Accordion elevation={0} disableGutters className={styles.cancellationHistory}>
            <AccordionSummary>
              היסטוריית ביטול ושחזור ({cancellationEntries.length})
            </AccordionSummary>
            <AccordionDetails>
              <Timeline entries={cancellationEntries} />
            </AccordionDetails>
          </Accordion>
        )}
        {editor.error && (
          <Box role="alert" component="div" className={styles.error}>
            {editor.error}
            <Box component="div" className={styles.row}>
              <Button text="נסה לשמור שוב" onClick={editor.retry} />
              <Button text="טען גרסה מהשרת" onClick={reloadQuotation} />
            </Box>
          </Box>
        )}
        {pdf.error && (
          <Box role="alert" component="div" className={styles.error}>
            {pdf.error}
          </Box>
        )}
        <Box component="div" className={styles.metadata}>
          <QuotationCustomerPicker
            disabled={disabled}
            value={quotation.customerId}
            lockedReason={contextLockedReason}
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
            lockedReason={contextLockedReason}
            selectedName={quotation.projectName}
            onChange={projectId => update({ ...quotation, projectId })}
          />
          <QuotationSalesAgentPicker
            onChange={changeSalesAgent}
            value={quotation.salesAgentId}
            selectedName={quotation.salesAgentName}
            disabled={
              !editable ||
              editor.busy ||
              editor.dirty ||
              rebrand.busy ||
              quotation.status === QUOTATION_STATUS.CANCELLED
            }
          />
          {quotation.brands.length === 1 && (
            <QuotationSelect
              label="חברת מיזוג"
              disabled={disabled}
              value={quotation.brand}
              caption="החלפת החברה בלשונית הקיימת"
              onChange={event => rebrand.request(event.target.value)}
            >
              {QUOTATION_BRANDS.map(brand => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </QuotationSelect>
          )}
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
        </Box>
        <TextField
          multiline
          minRows={3}
          maxLength={5000}
          disabled={disabled}
          type={FIELD_TYPES.TEXT}
          value={quotation.internalNotes}
          title="הערות פנימיות (לא יופיעו ללקוח)"
          onChange={internalNotes => update({ ...quotation, internalNotes })}
        />
        {openingLine && (
          <Box component="div" className={styles.openingLine}>
            <Box component="span" className={styles.muted}>
              שורת פתיחה בהצעה:
            </Box>
            <Box component="span">{openingLine}</Box>
          </Box>
        )}
        {rebrand.error && (
          <Box role="alert" component="p" className={styles.error}>
            {rebrand.error}
          </Box>
        )}
        {rebrand.pendingBrand !== null && (
          <Box component="div" className={styles.error}>
            להחליף חברה ולבחור פריטי קטלוג תואמים? המיקומים והכמויות יישמרו. אם חסר פריט תואם, ההצעה
            לא תשתנה.
            <Box component="div" className={styles.row}>
              <Button
                isLoading={rebrand.busy}
                onClick={rebrand.confirm}
                text="החלף לפריטים תואמים"
                disabled={rebrand.busy || editor.busy || editor.dirty}
              />
              <Button text="ביטול" disabled={rebrand.busy} onClick={rebrand.cancel} />
            </Box>
          </Box>
        )}
        {disabled && (
          <Box component="p" className={styles.muted}>
            {cancellationNoun === "הזמנה" ? "ההזמנה" : "ההצעה"} נעולה לעריכה או שאין הרשאת עדכון.
          </Box>
        )}
      </Card>
      {sharing.isBuilding && (
        <QuotationApartmentSharingCard sharing={sharing} canEdit={editable} quotation={quotation} />
      )}
      {blocker.state === "blocked" && (
        <Card>
          <Box component="p">יש שינויים שטרם נשמרו. הניווט ימשיך לאחר שמירה מוצלחת.</Box>
          <Button text="הישאר בהצעה" onClick={() => blocker.reset()} />
          <Button text="עזוב בלי לשמור שינויים" onClick={() => blocker.proceed()} />
        </Card>
      )}
      {isSummaryVisible && (
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
      {isEditorVisible && <QuotationDiagnostics quotation={quotation} />}
      {isEditorVisible && (
        <Card>
          <Box component="div" className={styles.cardTitle}>
            <Box component="span" aria-hidden="true" className={styles.cardIcon}>
              <Icon name={ICON_NAMES.QUOTE} />
            </Box>
            <Box component="div">
              <Box component="h2">מערכות ושורות</Box>
              <Box component="p" className={styles.muted}>
                כל שורה נבחרת מהמחירון. מחיר, תיאור ויחידה נשמרים בשורה ולא משתנים עם המחירון
              </Box>
            </Box>
          </Box>
          <Tabs
            mode={TAB_MODES.TABS}
            items={brandTabs.items}
            onChange={setActiveTab}
            variant={TABS_VARIANTS.PILLS}
            activeId={brandTabs.selectedId}
            ariaLabel="לשוניות חברות ופריטים כלליים"
          />
          {!disabled && (
            <Box component="div" className={styles.row}>
              <QuotationSelect
                value=""
                label="הוספת לשונית חברה"
                onChange={event => {
                  const brand = event.target.value;
                  if (!brand || quotation.brands.includes(brand)) {
                    return;
                  }
                  update(addQuotationBrand(quotation, brand));
                  setActiveTab(brand);
                }}
              >
                <MenuItem value="">בחרו חברה להוספה...</MenuItem>
                {QUOTATION_BRANDS.filter(brand => !quotation.brands.includes(brand)).map(brand => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </QuotationSelect>
              {brandTabs.brand &&
                !quotation.sections.some(section => section.brand === brandTabs.brand) && (
                  <Button
                    text="הסר לשונית ריקה"
                    size={BUTTON_SIZES.COMPACT}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() => {
                      const next = removeEmptyQuotationBrand(quotation, brandTabs.brand ?? "");
                      update(next);
                      setActiveTab(next.brands[0] ?? QUOTATION_GENERAL_TAB_ID);
                    }}
                  />
                )}
            </Box>
          )}
          {brandTabs.sections.map(({ section, index }) => (
            <QuotationSection
              key={section.id}
              section={section}
              disabled={disabled}
              brand={brandTabs.brand ?? ""}
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
            <Box component="div" className={styles.systemActions}>
              <Box component="span">הוספת מערכת / קומה</Box>
              <Box component="div" className={styles.row}>
                {systems
                  .filter(
                    ({ value }) => brandTabs.brand !== null || value === QUOTATION_SYSTEM.GENERAL,
                  )
                  .map(({ value: systemType, label }) => (
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
                            {
                              id: crypto.randomUUID(),
                              title: "",
                              systemType,
                              brand: brandTabs.brand,
                              items: [],
                            },
                          ],
                        })
                      }
                    />
                  ))}
              </Box>
            </Box>
          )}
        </Card>
      )}
      {isEditorVisible && (
        <QuotationPayments onChange={update} disabled={disabled} quotation={quotation} />
      )}
      <QuotationSummary
        blocked={blocked}
        onChange={update}
        disabled={disabled}
        quotation={quotation}
        canApprove={canApprove}
        onTransition={transition}
        showWarnings={isEditorVisible}
        onAcknowledge={editor.acknowledge}
        deleteAction={
          canDelete && (
            <QuotationDelete
              number={quotation.number}
              blocked={blocked}
              pending={editor.busy}
              error={editor.deleteError}
              onDelete={editor.remove}
              onReload={reloadQuotation}
            />
          )
        }
      />
      <GenericPopup
        closeAfterAction={false}
        dir={TEXT_DIRECTIONS.RTL}
        open={isConfirmationOpen}
        title={confirmationTitle}
        closeDisabled={editor.commandBusy}
        onClose={() => setConfirmation(null)}
        buttons={{
          primary: {
            text: confirmationActionLabel,
            isDisabled:
              blocked ||
              !requestedActionAvailable ||
              (confirmation === QUOTATION_CONFIRMATION.CANCEL && !cancellationReason.trim()),
            onClick: confirmQuotationAction,
          },
          secondary: {
            text: "חזרה",
            isDisabled: editor.commandBusy,
            onClick: () => setConfirmation(null),
          },
        }}
        content={
          <Box component="div">
            <Box component="p">{confirmationDescription}</Box>
            {latestLoadedAfterConflict && (
              <Box component="p" role="status" className={styles.muted}>
                הגרסה העדכנית נטענה. בדקו את הפרטים לפני אישור מחדש.
              </Box>
            )}
            {confirmation === QUOTATION_CONFIRMATION.CANCEL && (
              <TextField
                multiline
                minRows={3}
                isRequired
                type={FIELD_TYPES.TEXT}
                value={cancellationReason}
                disabled={editor.commandBusy}
                title="סיבת ביטול"
                maxLength={MAX_QUOTATION_CANCELLATION_REASON_LENGTH}
                onChange={setCancellationReason}
              />
            )}
            {showConfirmationError && (
              <Box component="div" role="alert" className={styles.error}>
                {editor.error}
                <Button
                  text={editor.hasVersionConflict ? "טען גרסה עדכנית" : "אפשר ניסיון חוזר"}
                  onClick={editor.hasVersionConflict ? reloadConflict : editor.retry}
                />
              </Box>
            )}
          </Box>
        }
      />
    </Box>
  );
};
export default QuotationEditor;
