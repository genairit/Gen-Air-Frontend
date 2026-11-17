import {
  useCreateExecutionPlanMutation,
  useSubmitExecutionPlanMutation,
  useUpdateExecutionPlanChecklistMutation,
} from "../../../hooks/mutations/execution-plan.mutation";

import type { FC } from "react";
import { useState } from "react";
import { Box } from "@mui/material";
import Button from "../../../components/Button/Button";
import CheckBox from "../../../components/CheckBox/CheckBox";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import LoadingState from "../../../components/LoadingState/LoadingState";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IProjectFile } from "../../../interfaces/project.interface";
import { EXECUTION_PLAN_COPY } from "../../../constants/execution-plan.constant";
import { useProjectQuotationsQuery } from "../../../hooks/queries/quotation.query";
import { validateFreeText } from "../../../utilities/validators/free-text.validator";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IExecutionPlanSubmission } from "../../../interfaces/execution-plan.interface";
import { useExecutionPlanDraftForFileQuery } from "../../../hooks/queries/execution-plan.query";

interface IExecutionPlanSubmissionDialogProps {
  projectId: string;
  file: IProjectFile;
  onClose: () => void;
}

const ExecutionPlanSubmissionDialog: FC<IExecutionPlanSubmissionDialogProps> = ({
  projectId,
  file,
  onClose,
}) => {
  const [quotationId, setQuotationId] = useState("");
  const [planVersion, setPlanVersion] = useState("");
  const [draft, setDraft] = useState<IExecutionPlanSubmission | null>(null);
  const quotationsQuery = useProjectQuotationsQuery(projectId);
  const existingDraft = useExecutionPlanDraftForFileQuery(projectId, file.id);
  const currentDraft = draft ?? existingDraft.data ?? null;
  const create = useCreateExecutionPlanMutation();
  const checklist = useUpdateExecutionPlanChecklistMutation();
  const submit = useSubmitExecutionPlanMutation();
  const quotations = quotationsQuery.data?.pages.flatMap(page => page.items) ?? [];
  const busy = create.isPending || checklist.isPending || submit.isPending;
  const complete = currentDraft?.checklist.every(item => item.confirmed) ?? false;
  const error =
    create.error ?? checklist.error ?? submit.error ?? quotationsQuery.error ?? existingDraft.error;

  const createDraft = () => {
    create.mutate(
      { projectId, quotationId, driveFileId: file.id, planVersion: planVersion.trim() },
      { onSuccess: setDraft },
    );
  };

  const toggleItem = (key: string, confirmed: boolean) => {
    if (!currentDraft) {
      return;
    }
    const confirmedKeys = currentDraft.checklist
      .filter(item => (item.key === key ? confirmed : item.confirmed))
      .map(item => item.key);
    checklist.mutate({ submission: currentDraft, confirmedKeys }, { onSuccess: setDraft });
  };

  const submitDraft = () => {
    if (!currentDraft) {
      return;
    }
    submit.mutate(currentDraft, { onSuccess: onClose });
  };

  const primaryAction = currentDraft ? submitDraft : createDraft;
  const canContinue = currentDraft
    ? complete
    : quotationId.length > 0 && planVersion.trim().length > 0;

  return (
    <GenericPopup
      open
      maxWidth="md"
      onClose={onClose}
      closeDisabled={busy}
      closeAfterAction={false}
      title={EXECUTION_PLAN_COPY.SUBMIT_TITLE}
      buttons={{
        primary: {
          text: currentDraft ? EXECUTION_PLAN_COPY.SEND_FOR_REVIEW : "המשך לבדיקות",
          isDisabled: busy || existingDraft.isPending || !canContinue,
          onClick: primaryAction,
        },
        secondary: { text: "סגור", onClick: onClose },
      }}
      content={
        <Box sx={{ display: "grid", gap: "16px", paddingBlock: "12px" }}>
          <Box component="p">{file.name}</Box>
          {existingDraft.isPending && <LoadingState label={EXECUTION_PLAN_COPY.LOADING} />}
          {!currentDraft && !existingDraft.isPending && (
            <>
              {quotationsQuery.isPending && <LoadingState label={EXECUTION_PLAN_COPY.LOADING} />}
              {quotationsQuery.isSuccess && quotations.length === 0 && (
                <Box component="p">{EXECUTION_PLAN_COPY.NO_QUOTATIONS}</Box>
              )}
              <Autocomplete
                title={EXECUTION_PLAN_COPY.SELECT_QUOTATION}
                value={quotationId || null}
                isAutocomplete={false}
                isLoading={quotationsQuery.isPending}
                items={quotations.map(quotation => ({
                  value: quotation.id,
                  label: `${quotation.number} · ${quotation.customerName ?? quotation.projectName}`,
                }))}
                onChange={value => setQuotationId(value ?? "")}
              />
              {quotationsQuery.hasNextPage && (
                <Button
                  text="טען הצעות נוספות"
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  onClick={async () => {
                    await quotationsQuery.fetchNextPage();
                  }}
                />
              )}
              <TextField
                type={FIELD_TYPES.TEXT}
                validator={validateFreeText}
                title={EXECUTION_PLAN_COPY.PLAN_VERSION}
                value={planVersion}
                onChange={setPlanVersion}
              />
            </>
          )}
          {currentDraft && (
            <>
              <Box component="h3">{EXECUTION_PLAN_COPY.CHECKLIST}</Box>
              <Box component="p" role="status">
                {currentDraft.checklist.filter(item => item.confirmed).length} מתוך{" "}
                {currentDraft.checklist.length} אושרו
              </Box>
              {currentDraft.checklist.map(item => (
                <CheckBox
                  key={item.key}
                  text={item.label}
                  value={item.confirmed}
                  disabled={busy}
                  onChange={checked => toggleItem(item.key, checked)}
                />
              ))}
              {!complete && <Box component="p">{EXECUTION_PLAN_COPY.CHECKLIST_INCOMPLETE}</Box>}
            </>
          )}
          {error && <InlineError message={getApiErrorMessage(error)} />}
        </Box>
      }
    />
  );
};

export default ExecutionPlanSubmissionDialog;
