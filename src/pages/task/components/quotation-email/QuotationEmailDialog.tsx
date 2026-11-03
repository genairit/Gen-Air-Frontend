import {
  QUOTATION_EMAIL_STATUS,
  type QuotationEmailStepType,
  QUOTATION_EMAIL_STEP_ACTION_LABELS,
} from "../../../../constants/quotation-execution-email.constant";

import { useState } from "react";
import Card from "../../../../components/Card/Card";
import styles from "./QuotationEmailDialog.module.css";
import Button from "../../../../components/Button/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logger } from "../../../../utilities/logger.utility";
import CheckBox from "../../../../components/CheckBox/CheckBox";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import TextField from "../../../../components/TextField/TextField";
import BrandLogo from "../../../../components/BrandLogo/BrandLogo";
import FieldLabel from "../../../../components/FieldLabel/FieldLabel";
import InlineError from "../../../../components/InlineError/InlineError";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { IApiDriveItem } from "../../../../interfaces/api.interface";
import LoadingState from "../../../../components/LoadingState/LoadingState";
import NoticeBanner from "../../../../components/NoticeBanner/NoticeBanner";
import GenericPopup from "../../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../../utilities/api-error.utility";
import { useProjectDriveQuery } from "../../../../hooks/queries/project.query";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../../components/TextField/constants/textfield.constants";
import { quotationExecutionEmailService } from "../../../../services/quotation-execution-email.service";

interface IQuotationEmailDialogProps {
  taskId: string;
  onClose: () => void;
}

const QuotationEmailDialog = ({ taskId, onClose }: IQuotationEmailDialogProps) => {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<QuotationEmailStepType>(1);
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [architectId, setArchitectId] = useState("");
  const [version, setVersion] = useState("");
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "תיקיית הפרויקט" },
  ]);
  const [plan, setPlan] = useState<IApiDriveItem | null>(null);
  const [zip, setZip] = useState<IApiDriveItem | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const contextQuery = useQuery({
    queryKey: ["quotation-execution-email", taskId],
    queryFn: () => quotationExecutionEmailService.getContext(taskId),
    retry: false,
  });
  const folderQuery = useProjectDriveQuery(
    contextQuery.data?.projectId ?? "",
    folderPath.at(-1)?.id ?? null,
    step === 2,
  );
  const sendMutation = useMutation({
    mutationFn: () => {
      if (!plan || !zip) {
        throw new Error("בחרו תוכנית וקובץ ZIP לפני השליחה");
      }
      return quotationExecutionEmailService.send(taskId, {
        requestId,
        recipientContactIds: recipientIds,
        architectContactId: architectId,
        planVersion: version.trim(),
        planFileId: plan.id,
        zipFileId: zip.id,
      });
    },
    onError: () => setRequestId(crypto.randomUUID()),
    onSettled: async () => {
      await contextQuery.refetch();
    },
  });
  const previewQuery = useQuery({
    queryKey: ["quotation-execution-email-preview", taskId, architectId, version.trim()],
    queryFn: () => quotationExecutionEmailService.getPreview(taskId, architectId, version.trim()),
    enabled: step === 2 && architectId.length > 0 && version.trim().length > 0,
    retry: false,
  });
  const context = contextQuery.data;
  const selectedContacts =
    context?.contacts.filter(contact => recipientIds.includes(contact.id)) ?? [];
  const architect = selectedContacts.find(contact => contact.id === architectId);
  const canContinue =
    context?.apartmentNumber != null &&
    version.trim().length > 0 &&
    recipientIds.length > 0 &&
    architect != null;
  const locked = sendMutation.isPending;
  const receipt = sendMutation.data ?? context?.delivery;
  const alreadySent = receipt?.status === QUOTATION_EMAIL_STATUS.SENT;
  const blocked =
    receipt != null && !receipt.retryable && receipt.status !== QUOTATION_EMAIL_STATUS.SENT;
  const canSend =
    plan != null && zip != null && plan.id !== zip.id && previewQuery.isSuccess && !blocked;
  const primaryDisabled =
    locked || blocked || (step === 1 && !canContinue) || (step === 2 && !alreadySent && !canSend);
  const primaryText = alreadySent ? "סגירה" : QUOTATION_EMAIL_STEP_ACTION_LABELS[step];
  const stepMotionOffset = step === 2 ? -10 : 10;
  const stepMotionInitial = reducedMotion ? false : { opacity: 0, x: stepMotionOffset };
  const stepMotionExit = reducedMotion ? { opacity: 1 } : { opacity: 0, x: -stepMotionOffset };
  const stepMotionTransition = { duration: reducedMotion ? 0 : 0.18 };

  const toggleRecipient = (id: string) => {
    setRecipientIds(current => {
      const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
      if (!next.includes(architectId)) {
        setArchitectId("");
      }
      return next;
    });
  };
  const chooseFile = (file: IApiDriveItem) => {
    if (/\.zip$/i.test(file.name)) {
      setZip(file);
      return;
    }
    setPlan(file);
  };
  const handlePrimaryAction = async () => {
    if (alreadySent) {
      onClose();
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    try {
      await sendMutation.mutateAsync();
    } catch (error) {
      logger.error("Quotation completion email send failed", { error });
    }
  };

  return (
    <GenericPopup
      open
      dir="rtl"
      align="right"
      maxWidth="md"
      onClose={onClose}
      closeDisabled={locked}
      closeAfterAction={false}
      title="שליחת תוכנית מיזוג אוויר לביצוע"
      buttons={{
        primary: {
          text: primaryText,
          isDisabled: primaryDisabled,
          onClick: handlePrimaryAction,
        },
        secondary: {
          text: "ביטול",
          isDisabled: locked,
          onClick: onClose,
        },
      }}
      content={
        <div className={styles.content}>
          <p className={styles.stepHint}>
            שלב {step} מתוך 2 · שליחת המייל היא בחירה נפרדת מהשלמת המשימה.
          </p>
          {contextQuery.isPending && <LoadingState label="טוען פרטי משימה" />}
          {contextQuery.isError && <InlineError message={getApiErrorMessage(contextQuery.error)} />}
          {context && !context.apartmentNumber && (
            <InlineError message="יש להזין מספר דירה בפרויקט לפני שליחת המייל." />
          )}
          {alreadySent && <NoticeBanner title="המייל כבר נשלח בהצלחה." lines={[]} />}
          {blocked && (
            <InlineError message="קיים ניסיון שליחה שטרם אושר. יש לבדוק את מצב המייל לפני ניסיון נוסף." />
          )}
          {blocked && (
            <Button
              text="רענן מצב שליחה"
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={async () => {
                await contextQuery.refetch();
              }}
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            {context && !alreadySent && (
              <motion.section
                key={step}
                className={styles.section}
                initial={stepMotionInitial}
                animate={{ opacity: 1, x: 0 }}
                exit={stepMotionExit}
                transition={stepMotionTransition}
              >
                {step === 1 && (
                  <>
                    <FieldLabel title="בחרו אנשי קשר שיקבלו את המייל" />
                    {context.contacts.length === 0 && (
                      <InlineError message="לא נמצאו אנשי קשר עם כתובת מייל אצל הלקוח." />
                    )}
                    <div className={styles.contactList}>
                      {context.contacts.map(contact => (
                        <div className={styles.contactRow} key={contact.id}>
                          <CheckBox
                            value={recipientIds.includes(contact.id)}
                            onChange={() => toggleRecipient(contact.id)}
                            ariaLabel={`${contact.name} · ${contact.email}`}
                            text={
                              <span className={styles.contactLabel}>
                                <span>{contact.name}</span>
                                <bdi dir="ltr">{contact.email}</bdi>
                              </span>
                            }
                          />
                          {recipientIds.includes(contact.id) && (
                            <Button
                              onClick={() => setArchitectId(contact.id)}
                              text={architectId === contact.id ? "אדריכל ✓" : "סמן כאדריכל"}
                              variant={
                                architectId === contact.id
                                  ? BUTTON_VARIANTS.PRESSED
                                  : BUTTON_VARIANTS.NEUTRAL
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <TextField
                      maxLength={80}
                      value={version}
                      title="גרסת התוכנית"
                      onChange={setVersion}
                      type={FIELD_TYPES.TEXT}
                      placeholder="לדוגמה: 03"
                    />
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className={styles.folderHeading}>
                      <FieldLabel title="בחרו קבצים מתיקיית הפרויקט" />
                      <Button
                        text="חזרה לאנשי קשר"
                        variant={BUTTON_VARIANTS.NEUTRAL}
                        onClick={() => setStep(1)}
                        disabled={locked}
                      />
                    </div>
                    <p className={styles.folderPath}>
                      {folderPath.map(folder => folder.name).join(" / ")}
                    </p>
                    {folderPath.length > 1 && (
                      <Button
                        text="חזרה לתיקייה הקודמת"
                        variant={BUTTON_VARIANTS.NEUTRAL}
                        onClick={() => setFolderPath(path => path.slice(0, -1))}
                      />
                    )}
                    {folderQuery.isPending && <LoadingState label="טוען קבצים" />}
                    {folderQuery.isError && (
                      <InlineError message={getApiErrorMessage(folderQuery.error)} />
                    )}
                    <div className={styles.fileList}>
                      {folderQuery.data?.folders.map(folder => (
                        <div className={styles.fileChoice} key={folder.id}>
                          <Button
                            text={folder.name}
                            icon={ICON_NAMES.FOLDER}
                            ariaLabel={`📁 ${folder.name}`}
                            variant={BUTTON_VARIANTS.NEUTRAL}
                            onClick={() =>
                              setFolderPath(path => [...path, { id: folder.id, name: folder.name }])
                            }
                          />
                        </div>
                      ))}
                      {folderQuery.data?.files.map(file => {
                        const selected = plan?.id === file.id || zip?.id === file.id;
                        const fileLabel = `${/\.zip$/i.test(file.name) ? "ZIP" : "תוכנית"}: ${file.name}`;
                        return (
                          <div className={styles.fileChoice} key={file.id}>
                            <Button
                              text={`${fileLabel}${selected ? " ✓" : ""}`}
                              icon={ICON_NAMES.DOCUMENT}
                              ariaLabel={`${fileLabel}${selected ? " נבחר" : ""}`}
                              variant={selected ? BUTTON_VARIANTS.PRESSED : BUTTON_VARIANTS.NEUTRAL}
                              onClick={() => chooseFile(file)}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className={styles.fileSummary}>
                      תוכנית: {plan?.name ?? "טרם נבחרה"} · ZIP: {zip?.name ?? "טרם נבחר"}
                    </p>
                    {plan && zip && plan.id !== zip.id && (
                      <Card ariaLabel="תצוגה מקדימה של המייל" padding="20px">
                        <div className={styles.preview}>
                          <FieldLabel title="תצוגה מקדימה" />
                          <p className={styles.previewHeading}>
                            אל:{" "}
                            <bdi dir="ltr">
                              {selectedContacts.map(contact => contact.email).join(", ")}
                            </bdi>
                          </p>
                          {previewQuery.isPending && <LoadingState label="טוען תצוגה מקדימה" />}
                          {previewQuery.isError && (
                            <InlineError message={getApiErrorMessage(previewQuery.error)} />
                          )}
                          {previewQuery.data && (
                            <>
                              <p className={styles.previewHeading}>
                                נושא: {previewQuery.data.subject}
                              </p>
                              <p className={styles.previewBody}>{previewQuery.data.body}</p>
                              <div className={styles.signature}>
                                <BrandLogo width="180px" alt="GenAir" />
                                <strong>{previewQuery.data.senderName}</strong>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </motion.section>
            )}
          </AnimatePresence>
          {sendMutation.isError && <InlineError message={getApiErrorMessage(sendMutation.error)} />}
        </div>
      }
    />
  );
};

export default QuotationEmailDialog;
