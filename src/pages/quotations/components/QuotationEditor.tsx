import {
  QUOTATION_BRANDS,
  QUOTATION_CONFIRMATION,
  QUOTATION_STATUS_LABELS,
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
} from "../../../utilities/quotation-cancellation.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import Button from "./QuotationButton";
import { useRef, useState } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import QuotationDelete from "./QuotationDelete";
import Card from "../../../components/Card/Card";
import QuotationSummary from "./QuotationSummary";
import QuotationPayments from "./QuotationPayments";
import QuotationWorkspace from "./QuotationWorkspace";
import QuotationDiagnostics from "./QuotationDiagnostics";
import { useLocation, useNavigate } from "react-router-dom";
import QuotationDecimalInput from "./QuotationDecimalInput";
import BackLink from "../../../components/BackLink/BackLink";
import Timeline from "../../../components/Timeline/Timeline";
import QuotationProjectPicker from "./QuotationProjectPicker";
import { useSessionUser } from "../../../store/session.store";
import TextField from "../../../components/TextField/TextField";
import QuotationCustomerPicker from "./QuotationCustomerPicker";
import ExecutionPlanReviewCard from "./ExecutionPlanReviewCard";
import { buildTaskPath } from "../../../utilities/route.utility";
import { USER_ROLES } from "../../../constants/user-role.constant";
import { useElementFocus } from "../../../hooks/element-focus.hook";
import QuotationSalesAgentPicker from "./QuotationSalesAgentPicker";
import { useQuotationPdf } from "../../../hooks/quotation-pdf.hook";
import { PERMISSIONS } from "../../../constants/permission.constant";
import QuotationPublicationNotice from "./QuotationPublicationNotice";
import { hasPermission } from "../../../utilities/permission.utility";
import { getAssignedRoles } from "../../../utilities/user-role.utility";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import { useCustomerQuery } from "../../../hooks/queries/customer.query";
import { formatDateInputDisplay } from "../../../utilities/date.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { useQuotationEditor } from "../../../hooks/quotation-editor.hook";
import { useHashTargetFocus } from "../../../hooks/hash-target-focus.hook";
import { useQuotationRebrand } from "../../../hooks/quotation-rebrand.hook";
import QuotationCustomerPaymentDefault from "./QuotationCustomerPaymentDefault";
import { buildQuotationClonePath } from "../../../constants/navigation.constant";
import { QUOTATION_LIFECYCLE_COPY } from "../../../constants/quotation.constant";
import { TASK_QUOTATION_COPY } from "../../../constants/task-quotation.constant";
import { Box, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useQuotationPublication } from "../../../hooks/quotation-publication.hook";
import { QUOTATION_DETAIL_HEADING_ID } from "../../../constants/quotation.constant";
import QuotationApartmentSharingCard from "./sharing/QuotationApartmentSharingCard";
import { validateQuotationReason } from "../../../utilities/quotation-reason.utility";
import { QUOTATION_LIFECYCLE_BUTTON_SX } from "../../../constants/quotation.constant";
import { QUOTATION_SHARING_COPY } from "../../../constants/quotation-sharing.constant";
import { quotationSaveLabel } from "../../../utilities/quotation-presentation.utility";
import { quotationOpeningLine } from "../../../utilities/quotation-presentation.utility";
import { quotationNeedsCorrection } from "../../../utilities/quotation-rejection.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { quotationLifecycleTimeline } from "../../../utilities/quotation-lifecycle.utility";
import { useUnsavedChangesNavigation } from "../../../hooks/unsaved-changes-navigation.hook";
import { useQuotationApartmentSharing } from "../../../hooks/quotation-apartment-sharing.hook";
import { useQuotationDeletedNavigation } from "../../../hooks/quotation-deleted-navigation.hook";
import { quotationActionAvailabilityMessage } from "../../../utilities/quotation-lifecycle.utility";
import ValidationMessageText from "../../../components/ValidationMessageText/ValidationMessageText";
import { NOTICE_VARIANTS } from "../../../vendor/smartbase/components/NoticeCard/constants/notice-card.constant";

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
  const location = useLocation();
  useHashTargetFocus({
    ready: true,
    targetId: QUOTATION_DETAIL_HEADING_ID,
    focusId: QUOTATION_DETAIL_HEADING_ID,
  });
  const sessionUser = useSessionUser();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rejectionInputRef = useRef<HTMLTextAreaElement>(null);
  const cancellationInputRef = useRef<HTMLTextAreaElement>(null);
  const confirmationTitleRef = useRef<HTMLHeadingElement>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const [originalCustomerId] = useState(initial.customerId);
  const [editingStatus, setEditingStatus] = useState<TQuotationStatus | null>(null);
  const [confirmation, setConfirmation] = useState<TQuotationConfirmation | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [latestLoadedAfterConflict, setLatestLoadedAfterConflict] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(!initial.customerId);
  const [viewDraft, setViewDraft] = useState(false);
  const editor = useQuotationEditor(initial, editable, canDelete);
  const { quotation, update } = editor;
  const customer = useCustomerQuery(quotation.customerId || null);
  const pdf = useQuotationPdf(quotation.id);
  const publication = useQuotationPublication(quotation.id, quotation.version);
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
  const blocked =
    editor.busy ||
    editor.dirty ||
    rebrand.busy ||
    editor.error !== null ||
    editor.requiresReload ||
    editor.commandForbidden;
  const navigationPending = !editor.deleted && (editor.dirty || editor.busy || rebrand.busy);
  const blocker = useUnsavedChangesNavigation(navigationPending);
  useQuotationDeletedNavigation(editor.deleted, quotation.id, quotation.primaryProject?.id ?? null);
  const isSummaryVisible =
    !editable ||
    (quotation.status === QUOTATION_STATUS.DRAFT ? viewDraft : editingStatus !== quotation.status);
  const isEditorVisible = !isSummaryVisible;
  const statusText = quotationSaveLabel({
    busy: editor.busy,
    dirty: editor.dirty,
    updatedAt: quotation.updatedAt,
  });
  const lifecycleStatusText = `${QUOTATION_STATUS_LABELS[quotation.status]} · ${statusText}`;
  const taskContextLockedReason = quotation.taskContextLocked ? TASK_QUOTATION_COPY.LOCKED : null;
  const taskProjectLockedReason = quotation.taskProjectLocked ? TASK_QUOTATION_COPY.LOCKED : null;
  const customerLockedReason = sharing.hasLinks
    ? QUOTATION_SHARING_COPY.CONTEXT_LOCKED
    : taskContextLockedReason;
  const projectLockedReason = sharing.hasLinks
    ? QUOTATION_SHARING_COPY.CONTEXT_LOCKED
    : taskProjectLockedReason;
  const canReadTasks = hasPermission(sessionUser, PERMISSIONS.TASKS_READ);
  const taskLinks = canReadTasks ? (quotation.taskLinks ?? []) : [];
  const openingLine = quotationOpeningLine(quotation);
  const cancellationEntries = quotationLifecycleTimeline(quotation, publication.publication);
  const latestRejection = quotation.rejectionHistory.at(-1);
  const needsCorrection = quotationNeedsCorrection(quotation);
  const canReject =
    canApprove &&
    sessionUser !== null &&
    getAssignedRoles(sessionUser).some(
      (role): boolean => role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.ENGINEERING_LEAD,
    );
  const rejectionAvailable = canReject && quotation.status === QUOTATION_STATUS.REVIEW;
  const canReturnApproved = canApprove && quotation.status === QUOTATION_STATUS.APPROVED;
  const canReturnReview = canReject && quotation.status === QUOTATION_STATUS.REVIEW;
  const canReturn = canReturnApproved || canReturnReview;
  const cancellationNoun = quotationCancellationNoun(quotation);
  const canCancelQuotation = canCancel && quotation.status !== QUOTATION_STATUS.CANCELLED;
  const canRestoreQuotation = canRestore && quotation.status === QUOTATION_STATUS.CANCELLED;
  const confirmationView =
    confirmation === null ? null : quotationCancellationView(quotation, confirmation);
  const isConfirmationOpen = confirmationView !== null;
  const isCancellationConfirmation = confirmation === QUOTATION_CONFIRMATION.CANCEL;
  const confirmationFocusRef = isCancellationConfirmation
    ? cancellationInputRef
    : confirmationTitleRef;
  const confirmationTitle = confirmationView?.title ?? "";
  const confirmationActionLabel = confirmationView?.actionLabel ?? "";
  const confirmationDescription = confirmationView?.description ?? "";
  const confirmationError = editor.error ?? "";
  const showConfirmationError = isConfirmationOpen && editor.error !== null;
  const availableActions = {
    [QUOTATION_CONFIRMATION.CANCEL]: canCancelQuotation,
    [QUOTATION_CONFIRMATION.RESTORE]: canRestoreQuotation,
    [QUOTATION_CONFIRMATION.RETURN]: canReturn,
  };
  const requestedActionAvailable = confirmation !== null && availableActions[confirmation];
  const rejectionAvailabilityMessage = quotationActionAvailabilityMessage({
    available: rejectionAvailable,
    forbidden: editor.commandForbidden,
  });
  const confirmationAvailabilityMessage = quotationActionAvailabilityMessage({
    available: requestedActionAvailable,
    forbidden: editor.commandForbidden,
  });
  const rejectionReasonInvalid = !validateQuotationReason(rejectionReason).isValid;
  const cancellationReasonInvalid =
    isCancellationConfirmation && !validateQuotationReason(cancellationReason).isValid;
  const rejectionConfirmDisabled = blocked || !rejectionAvailable || rejectionReasonInvalid;
  const confirmationDisabled = blocked || !requestedActionAvailable || cancellationReasonInvalid;
  const confirmationActions: Record<TQuotationConfirmation, () => Promise<boolean>> = {
    [QUOTATION_CONFIRMATION.CANCEL]: (): Promise<boolean> => editor.cancel(cancellationReason),
    [QUOTATION_CONFIRMATION.RESTORE]: editor.restore,
    [QUOTATION_CONFIRMATION.RETURN]: (): Promise<boolean> =>
      editor.transition(QUOTATION_STATUS.DRAFT),
  };
  const hasCompletedCommand = focusVersion > 0;
  const focusStatusHeading = hasCompletedCommand && !isConfirmationOpen && !rejecting;
  useElementFocus(headingRef, focusStatusHeading, focusVersion);
  const recoveryLabel = editor.requiresReload ? "טען גרסה עדכנית" : "אפשר ניסיון חוזר";
  const changeRejectionReason = (reason: string): void => {
    setRejectionReason(reason);
    editor.retry();
  };
  const changeCancellationReason = (reason: string): void => {
    setCancellationReason(reason);
    editor.retry();
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
    setViewDraft(false);
    setFocusVersion((current): number => current + 1);
  };
  const reloadConflict = async (): Promise<void> => {
    const loaded = await editor.reload();
    if (loaded) {
      setLatestLoadedAfterConflict(true);
    }
  };
  const recoverCommand = async (): Promise<void> => {
    if (editor.requiresReload) {
      await reloadConflict();
      return;
    }
    editor.retry();
  };
  const reloadQuotation = async (): Promise<void> => {
    await editor.reload();
  };
  const transition = async (status: TQuotationStatus): Promise<void> => {
    const accepted = await editor.transition(status);
    if (accepted) {
      setEditingStatus(null);
      setViewDraft(false);
      setFocusVersion((current): number => current + 1);
    }
  };
  const rejectQuotation = async (): Promise<void> => {
    if (!validateQuotationReason(rejectionReason).isValid) {
      return;
    }
    const accepted = await editor.reject(rejectionReason);
    if (accepted) {
      setRejecting(false);
      setRejectionReason("");
      setEditingStatus(null);
      setViewDraft(false);
      setFocusVersion((current): number => current + 1);
    }
  };
  const resubmitQuotation = async (): Promise<void> => {
    const accepted = await editor.resubmit();
    if (accepted) {
      setEditingStatus(null);
      setViewDraft(false);
      setFocusVersion((current): number => current + 1);
    }
  };
  const requestReturn = (): void => setConfirmation(QUOTATION_CONFIRMATION.RETURN);
  const requestRejection = (): void => setRejecting(true);
  const returnAction = canReturn ? requestReturn : null;
  const rejectionAction = canReject ? requestRejection : null;
  const changeSalesAgent = async (salesAgentId: string | null): Promise<void> => {
    if (quotation.status === QUOTATION_STATUS.APPROVED) {
      await editor.updateSalesAgent(salesAgentId);
      return;
    }

    update({ ...quotation, salesAgentId });
  };
  return (
    <Box component="main" className={styles.editorPage}>
      <Card depth="flat">
        <Box component="div" className={styles.quotationHeader}>
          <Box component="div" className={styles.quotationHeaderTop}>
            <Box component="div" className={styles.quotationIdentity}>
              <Box
                tabIndex={-1}
                component="h1"
                ref={headingRef}
                className={styles.heading}
                id={QUOTATION_DETAIL_HEADING_ID}
              >
                {quotation.number}
              </Box>
              <Box
                component="span"
                className={styles.badge}
                data-status={quotation.status}
                data-needs-correction={needsCorrection}
              >
                {needsCorrection ? "נדרש תיקון" : QUOTATION_STATUS_LABELS[quotation.status]}
              </Box>
            </Box>
            <Box component="div" className={styles.quotationActions}>
              {editable &&
                quotation.status !== QUOTATION_STATUS.APPROVED &&
                quotation.status !== QUOTATION_STATUS.CANCELLED && (
                  <Button
                    disabled={blocked}
                    size={BUTTON_SIZES.COMPACT}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    text={isSummaryVisible ? "עריכה" : "תצוגה"}
                    onClick={() => {
                      setViewDraft(!isSummaryVisible);
                      setEditingStatus(isSummaryVisible ? quotation.status : null);
                    }}
                  />
                )}
              {canClone &&
                quotation.brands.length === 1 &&
                quotation.sections.some(section => section.brand === quotation.brands[0]) && (
                  <Button
                    disabled={blocked}
                    text="צור העתק לחברה אחרת"
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() =>
                      navigate(buildQuotationClonePath(quotation.id), { state: location.state })
                    }
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
                  sx={QUOTATION_LIFECYCLE_BUTTON_SX}
                  onClick={() => setConfirmation(QUOTATION_CONFIRMATION.CANCEL)}
                />
              )}
              {canRestoreQuotation && (
                <Button
                  disabled={blocked}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  text={`שחזור ${cancellationNoun}`}
                  sx={QUOTATION_LIFECYCLE_BUTTON_SX}
                  onClick={() => setConfirmation(QUOTATION_CONFIRMATION.RESTORE)}
                />
              )}
              {canDelete && (
                <Box component="div" className={styles.deleteHeaderAction}>
                  <QuotationDelete
                    blocked={blocked}
                    pending={editor.busy}
                    onDelete={editor.remove}
                    number={quotation.number}
                    error={editor.deleteError}
                    onReload={reloadQuotation}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box component="span" aria-live="polite" className={styles.muted}>
            {lifecycleStatusText}
          </Box>
        </Box>
        {taskLinks.map(link => (
          <BackLink
            key={link.taskId}
            label={`משימה: ${link.title}`}
            to={buildTaskPath(link.taskId)}
          />
        ))}
        {latestRejection && (
          <NoticeBanner
            title={needsCorrection ? "נדרש תיקון בהצעה" : "הערת בדיקה קודמת"}
            variant={needsCorrection ? NOTICE_VARIANTS.error : NOTICE_VARIANTS.info}
            lines={[latestRejection.reason, `הוחזרה על ידי ${latestRejection.rejectedByName}`]}
          />
        )}
        {editor.error && (
          <Box role="alert" component="div" className={styles.error}>
            <ValidationMessageText text={editor.error} />
            <Box component="div" className={styles.row}>
              <Button text="נסה לשמור שוב" onClick={editor.retry} />
              <Button text="טען גרסה מהשרת" onClick={reloadQuotation} />
            </Box>
          </Box>
        )}
        {editor.requiresReload && (
          <Box role="status">
            <ValidationMessageText text={QUOTATION_LIFECYCLE_COPY.RELOAD_REQUIRED} />
            <Button text="טען גרסה עדכנית" onClick={reloadConflict} disabled={editor.commandBusy} />
          </Box>
        )}
        {editor.commandForbidden && (
          <Box component="p" role="status">
            {QUOTATION_LIFECYCLE_COPY.FORBIDDEN}
          </Box>
        )}
        {pdf.error && (
          <Box role="alert" component="div" className={styles.error}>
            <ValidationMessageText text={pdf.error} />
          </Box>
        )}
        <Accordion
          elevation={0}
          disableGutters
          className={styles.contextDisclosure}
          onChange={(_, expanded) => setDetailsExpanded(expanded)}
          expanded={detailsExpanded || !quotation.customerId || !quotation.projectId}
        >
          <AccordionSummary
            expandIcon={
              <Box component="span" aria-hidden="true">
                ⌄
              </Box>
            }
          >
            <Box component="span" className={styles.contextLine}>
              <Box component="strong">פרטי הצעה</Box>
              {[
                quotation.customerName || customer.data?.name,
                quotation.projectId &&
                  (quotation.projectName ||
                    (quotation.primaryProject?.id === quotation.projectId &&
                      quotation.primaryProject.name)),
                formatDateInputDisplay(quotation.date),
              ]
                .filter(Boolean)
                .join(" · ")}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="div" className={styles.metadata}>
              <QuotationCustomerPicker
                value={quotation.customerId}
                lockedReason={customerLockedReason}
                disabled={disabled || isSummaryVisible}
                onChange={(customerId, customerName) => {
                  if (customerId) {
                    update({
                      ...quotation,
                      customerId,
                      customerName,
                      projectId: null,
                      projectName: null,
                    });
                    setDetailsExpanded(false);
                  }
                }}
              />
              <QuotationProjectPicker
                value={quotation.projectId}
                customerId={quotation.customerId}
                lockedReason={projectLockedReason}
                selectedName={quotation.projectName}
                disabled={disabled || isSummaryVisible}
                onChange={(projectId, projectName) =>
                  update({ ...quotation, projectId, projectName })
                }
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
                  value={quotation.brand}
                  disabled={disabled || isSummaryVisible}
                  caption="החלפת החברה והתאמת פריטי הקטלוג"
                  onChange={event => rebrand.request(event.target.value)}
                  items={QUOTATION_BRANDS.map(brand => ({ value: brand, label: brand }))}
                />
              )}
              <QuotationDecimalInput
                min="0"
                max="100"
                step="0.01"
                type="number"
                label="הנחה %"
                value={quotation.discountPercent}
                disabled={disabled || isSummaryVisible || quotation.targetPretaxAmount !== null}
                onChange={event => update({ ...quotation, discountPercent: event.target.value })}
              />
              <QuotationInput
                type="date"
                label="תאריך"
                value={quotation.date}
                disabled={disabled || isSummaryVisible}
                onChange={event => update({ ...quotation, date: event.target.value })}
              />
            </Box>
            <Accordion elevation={0} disableGutters className={styles.detailsDisclosure}>
              <AccordionSummary>פרטים נוספים</AccordionSummary>
              <AccordionDetails>
                <TextField
                  multiline
                  minRows={3}
                  maxLength={5000}
                  type={FIELD_TYPES.TEXT}
                  value={quotation.internalNotes}
                  disabled={disabled || isSummaryVisible}
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
                {cancellationEntries.length > 0 && (
                  <Box
                    component="div"
                    className={styles.cancellationHistory}
                    sx={{ overflowWrap: "anywhere", minWidth: 0 }}
                  >
                    <Box component="h3">היסטוריית המסמך</Box>
                    <Timeline entries={cancellationEntries} />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </AccordionDetails>
        </Accordion>
        {rebrand.error && (
          <Box role="alert" component="p" className={styles.error}>
            <ValidationMessageText text={rebrand.error} />
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
      <QuotationWorkspace
        onChange={update}
        disabled={disabled}
        quotation={quotation}
        readOnly={isSummaryVisible}
      />
      {isEditorVisible && <QuotationDiagnostics quotation={quotation} />}
      <QuotationPublicationNotice {...publication} />
      {hasPermission(sessionUser, PERMISSIONS.EXECUTION_PLANS_READ) &&
        hasPermission(sessionUser, PERMISSIONS.QUOTATIONS_READ) &&
        hasPermission(sessionUser, PERMISSIONS.PROJECTS_READ) && (
          <ExecutionPlanReviewCard blocked={blocked} quotationId={quotation.id} />
        )}
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
      {isEditorVisible && (
        <QuotationPayments
          onChange={update}
          disabled={disabled}
          quotation={quotation}
          customerDefault={
            <QuotationCustomerPaymentDefault
              quotation={quotation}
              disabled={disabled}
              onChange={update}
              originalCustomerId={originalCustomerId}
            />
          }
        />
      )}
      <QuotationSummary
        blocked={blocked}
        onChange={update}
        quotation={quotation}
        canApprove={canApprove}
        onReturn={returnAction}
        onTransition={transition}
        onReject={rejectionAction}
        onResubmit={resubmitQuotation}
        onAcknowledge={editor.acknowledge}
        disabled={disabled || isSummaryVisible}
        canResubmit={needsCorrection && editable}
      />
      {rejecting && (
        <GenericPopup
          open={rejecting}
          closeAfterAction={false}
          dir={TEXT_DIRECTIONS.RTL}
          title="דחיית הצעה והחזרה לתיקון"
          closeDisabled={editor.commandBusy}
          initialFocusRef={rejectionInputRef}
          onClose={() => setRejecting(false)}
          buttons={{
            primary: {
              text: "דחה והחזר לתיקון",
              isDisabled: rejectionConfirmDisabled,
              onClick: rejectQuotation,
            },
            secondary: {
              text: "חזרה",
              isDisabled: editor.commandBusy,
              onClick: () => setRejecting(false),
            },
          }}
          content={
            <Box component="div">
              <Box component="p">
                סיבת הדחייה תוצג לצוות ההנדסה עד לשליחה מחדש לבדיקה. קובץ המחזור יועבר לארכיון
                ב-Drive.
              </Box>
              <TextField
                multiline
                minRows={3}
                isRequired
                type={FIELD_TYPES.TEXT}
                title="סיבת דחייה"
                validator={validateQuotationReason}
                inputRef={rejectionInputRef}
                value={rejectionReason}
                disabled={editor.commandBusy}
                maxLength={MAX_QUOTATION_CANCELLATION_REASON_LENGTH}
                onChange={changeRejectionReason}
              />
              {latestLoadedAfterConflict && (
                <Box component="p" role="status">
                  הגרסה העדכנית נטענה. בדקו את הפרטים לפני אישור מחדש.
                </Box>
              )}
              {rejectionAvailabilityMessage && (
                <Box role="status">
                  <ValidationMessageText text={rejectionAvailabilityMessage} />
                  <Button
                    text="טען פרטי מסמך מחדש"
                    onClick={reloadConflict}
                    disabled={editor.commandBusy}
                  />
                </Box>
              )}
              {editor.requiresReload && (
                <Box role="status">
                  <ValidationMessageText text={QUOTATION_LIFECYCLE_COPY.RELOAD_REQUIRED} />
                </Box>
              )}
              {editor.error && (
                <Box component="div" role="alert" className={styles.error}>
                  <ValidationMessageText text={editor.error} />
                  <Button text={recoveryLabel} onClick={recoverCommand} />
                </Box>
              )}
            </Box>
          }
        />
      )}
      <GenericPopup
        closeAfterAction={false}
        dir={TEXT_DIRECTIONS.RTL}
        open={isConfirmationOpen}
        title={confirmationTitle}
        titleRef={confirmationTitleRef}
        closeDisabled={editor.commandBusy}
        onClose={() => setConfirmation(null)}
        initialFocusRef={confirmationFocusRef}
        buttons={{
          primary: {
            text: confirmationActionLabel,
            isDisabled: confirmationDisabled,
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
                inputRef={cancellationInputRef}
                value={cancellationReason}
                disabled={editor.commandBusy}
                title="סיבת ביטול"
                validator={validateQuotationReason}
                maxLength={MAX_QUOTATION_CANCELLATION_REASON_LENGTH}
                onChange={changeCancellationReason}
              />
            )}
            {confirmationAvailabilityMessage && (
              <Box role="status">
                <ValidationMessageText text={confirmationAvailabilityMessage} />
                <Button
                  text="טען פרטי מסמך מחדש"
                  onClick={reloadConflict}
                  disabled={editor.commandBusy}
                />
              </Box>
            )}
            {editor.requiresReload && (
              <Box role="status">
                <ValidationMessageText text={QUOTATION_LIFECYCLE_COPY.RELOAD_REQUIRED} />
              </Box>
            )}
            {showConfirmationError && (
              <Box component="div" role="alert" className={styles.error}>
                <ValidationMessageText text={confirmationError} />
                <Button text={recoveryLabel} onClick={recoverCommand} />
              </Box>
            )}
          </Box>
        }
      />
    </Box>
  );
};
export default QuotationEditor;
