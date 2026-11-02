import {
  Box,
  Dialog,
  Checkbox,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material";

import { useState } from "react";
import Button from "../../../../components/Button/Button";
import genairLogo from "../../../../assets/genair-logo.png";
import { useMutation, useQuery } from "@tanstack/react-query";
import TextField from "../../../../components/TextField/TextField";
import InlineError from "../../../../components/InlineError/InlineError";
import type { IApiDriveItem } from "../../../../interfaces/api.interface";
import LoadingState from "../../../../components/LoadingState/LoadingState";
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
  const [step, setStep] = useState(1);
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
  const alreadySent = receipt?.status === "sent";
  const blocked = receipt != null && !receipt.retryable && receipt.status !== "sent";
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
    } else {
      setPlan(file);
    }
  };

  return (
    <Dialog
      open
      fullWidth
      dir="rtl"
      maxWidth="md"
      aria-labelledby="quotation-email-title"
      onClose={() => {
        if (!locked) {
          onClose();
        }
      }}
    >
      <DialogTitle id="quotation-email-title">שליחת תוכנית מיזוג אוויר לביצוע</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <Typography color="text.secondary">
          שלב {step} מתוך 2 · שליחת המייל היא בחירה נפרדת מהשלמת המשימה.
        </Typography>
        {contextQuery.isPending && <LoadingState label="טוען פרטי משימה" />}
        {contextQuery.isError && <InlineError message={getApiErrorMessage(contextQuery.error)} />}
        {context && !context.apartmentNumber && (
          <InlineError message="יש להזין מספר דירה בפרויקט לפני שליחת המייל." />
        )}
        {alreadySent && <Typography color="success.main">המייל כבר נשלח בהצלחה.</Typography>}
        {blocked && (
          <InlineError message="קיים ניסיון שליחה שטרם אושר. יש לבדוק את מצב המייל לפני ניסיון נוסף." />
        )}
        {step === 1 && context && !alreadySent && (
          <>
            <Typography variant="subtitle1">בחרו אנשי קשר שיקבלו את המייל</Typography>
            {context.contacts.length === 0 && (
              <InlineError message="לא נמצאו אנשי קשר עם כתובת מייל אצל הלקוח." />
            )}
            {context.contacts.map(contact => (
              <Box
                key={contact.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  label={`${contact.name} · ${contact.email}`}
                  control={
                    <Checkbox
                      checked={recipientIds.includes(contact.id)}
                      onChange={() => toggleRecipient(contact.id)}
                    />
                  }
                />
                {recipientIds.includes(contact.id) && (
                  <Button
                    onClick={() => setArchitectId(contact.id)}
                    text={architectId === contact.id ? "אדריכל ✓" : "סמן כאדריכל"}
                    variant={
                      architectId === contact.id ? BUTTON_VARIANTS.PRESSED : BUTTON_VARIANTS.NEUTRAL
                    }
                  />
                )}
              </Box>
            ))}
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
        {step === 2 && context && !alreadySent && (
          <>
            <Typography variant="subtitle1">בחרו קבצים מתיקיית הפרויקט</Typography>
            <Typography color="text.secondary">
              {folderPath.map(folder => folder.name).join(" / ")}
            </Typography>
            {folderPath.length > 1 && (
              <Button
                text="חזרה לתיקייה הקודמת"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setFolderPath(path => path.slice(0, -1))}
              />
            )}
            {folderQuery.isPending && <LoadingState label="טוען קבצים" />}
            {folderQuery.isError && <InlineError message={getApiErrorMessage(folderQuery.error)} />}
            {folderQuery.data?.folders.map(folder => (
              <Button
                key={folder.id}
                text={`📁 ${folder.name}`}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() =>
                  setFolderPath(path => [...path, { id: folder.id, name: folder.name }])
                }
              />
            ))}
            {folderQuery.data?.files.map(file => (
              <Button
                key={file.id}
                onClick={() => chooseFile(file)}
                text={`${/\.zip$/i.test(file.name) ? "ZIP" : "תוכנית"}: ${file.name}${plan?.id === file.id || zip?.id === file.id ? " ✓" : ""}`}
                variant={
                  plan?.id === file.id || zip?.id === file.id
                    ? BUTTON_VARIANTS.PRESSED
                    : BUTTON_VARIANTS.NEUTRAL
                }
              />
            ))}
            <Typography>
              תוכנית: {plan?.name ?? "טרם נבחרה"} · ZIP: {zip?.name ?? "טרם נבחר"}
            </Typography>
            {plan && zip && plan.id !== zip.id && (
              <Box
                sx={{ backgroundColor: "#f4f8fd", borderRadius: 3, p: 2, whiteSpace: "pre-wrap" }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  אל: {selectedContacts.map(contact => contact.email).join(", ")}
                </Typography>
                {previewQuery.isPending && <LoadingState label="טוען תצוגה מקדימה" />}
                {previewQuery.isError && (
                  <InlineError message={getApiErrorMessage(previewQuery.error)} />
                )}
                {previewQuery.data && (
                  <>
                    <Typography sx={{ fontWeight: 700 }}>
                      נושא: {previewQuery.data.subject}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{previewQuery.data.body}</Typography>
                  </>
                )}
                {previewQuery.data && (
                  <Box
                    sx={{
                      display: "grid",
                      justifyItems: "start",
                      mt: 2,
                      borderRight: "3px solid #1668bd",
                      pr: 2,
                    }}
                  >
                    <Box
                      alt="GenAir"
                      component="img"
                      src={genairLogo}
                      sx={{ width: 180, maxWidth: "100%" }}
                    />
                    <Typography sx={{ fontWeight: 700 }}>{previewQuery.data.senderName}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
        {sendMutation.isError && <InlineError message={getApiErrorMessage(sendMutation.error)} />}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          text="ביטול"
          disabled={locked}
          onClick={onClose}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
        {step === 2 && !alreadySent && (
          <Button
            disabled={locked}
            text="חזרה לאנשי קשר"
            onClick={() => setStep(1)}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        )}
        {step === 1 && !alreadySent && (
          <Button
            text="המשך לבחירת קבצים"
            onClick={() => setStep(2)}
            disabled={!canContinue || blocked}
          />
        )}
        {step === 2 && !alreadySent && (
          <Button
            text="שלח מייל"
            isLoading={locked}
            onClick={() => sendMutation.mutate()}
            disabled={!plan || !zip || plan.id === zip.id || blocked || !previewQuery.isSuccess}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuotationEmailDialog;
