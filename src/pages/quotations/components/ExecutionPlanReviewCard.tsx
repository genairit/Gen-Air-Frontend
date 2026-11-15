import {
  EXECUTION_PLAN_COPY,
  EXECUTION_PLAN_STATUS,
  EXECUTION_PLAN_STATUS_LABELS,
} from "../../../constants/execution-plan.constant";

import {
  useCancelExecutionPlanMutation,
  useDecideExecutionPlanMutation,
} from "../../../hooks/mutations/execution-plan.mutation";

import type { FC } from "react";
import { useState } from "react";
import { Box, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { buildApartmentPath, buildProjectPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import type { IExecutionPlanSubmission } from "../../../interfaces/execution-plan.interface";
import { useQuotationExecutionPlansQuery } from "../../../hooks/queries/execution-plan.query";

interface IExecutionPlanReviewCardProps {
  blocked: boolean;
  quotationId: string;
}

interface IExecutionPlanReviewRowProps {
  blocked: boolean;
  submission: IExecutionPlanSubmission;
}

const ExecutionPlanReviewRow: FC<IExecutionPlanReviewRowProps> = ({ submission, blocked }) => {
  const navigate = useNavigate();
  const user = useSessionUser();
  const [comment, setComment] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const decide = useDecideExecutionPlanMutation();
  const cancel = useCancelExecutionPlanMutation();
  const canReview =
    hasPermission(user, PERMISSIONS.EXECUTION_PLANS_APPROVE) &&
    submission.submittedById !== user?.id &&
    submission.status === EXECUTION_PLAN_STATUS.PENDING;
  const canCancel =
    submission.submittedById === user?.id &&
    [EXECUTION_PLAN_STATUS.DRAFT, EXECUTION_PLAN_STATUS.PENDING].some(
      status => status === submission.status,
    );
  const projectPath = submission.project?.parentProjectId
    ? buildApartmentPath(submission.project.parentProjectId, submission.projectId)
    : buildProjectPath(submission.projectId);
  const error = decide.error ?? cancel.error;

  return (
    <Box
      sx={{
        display: "grid",
        gap: "12px",
        borderBlockStart: "1px solid",
        borderColor: "divider",
        paddingBlock: "16px",
      }}
    >
      <Box component="div" sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <Box component="strong">{EXECUTION_PLAN_STATUS_LABELS[submission.status]}</Box>
        <Box component="span">{submission.project?.name ?? submission.projectId}</Box>
        <Box component="bdi">{submission.planVersion}</Box>
        {submission.submittedAt && (
          <Box component="span">{new Date(submission.submittedAt).toLocaleDateString("he-IL")}</Box>
        )}
      </Box>
      <Box
        dir="auto"
        component="a"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://drive.google.com/open?id=${encodeURIComponent(submission.driveFileId)}`}
      >
        פתח את הקובץ הנוכחי ב-Drive: {submission.driveFileName}
      </Box>
      <Box component="span">
        גרסת Drive שנרשמה בהגשה: {submission.driveFileVersion}. אם הקובץ השתנה מאז, נדרשת הגשה חדשה.
      </Box>
      <Box component="ul" sx={{ margin: 0, paddingInlineStart: "24px" }}>
        {submission.checklist.map(item => (
          <Box component="li" key={item.key}>
            {item.confirmed ? "✓" : "○"} {item.label}
          </Box>
        ))}
      </Box>
      {submission.returnComment && <Box component="p">{submission.returnComment}</Box>}
      {canReview && (
        <Box sx={{ display: "grid", gap: "12px" }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={comment}
            label={EXECUTION_PLAN_COPY.RETURN_COMMENT}
            onChange={event => setComment(event.target.value)}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Button
              text={EXECUTION_PLAN_COPY.APPROVE}
              disabled={blocked || decide.isPending}
              onClick={() => decide.mutate({ submission, decision: "approve", comment: "" })}
            />
            <Button
              text={EXECUTION_PLAN_COPY.RETURN}
              variant={BUTTON_VARIANTS.NEUTRAL}
              disabled={blocked || decide.isPending || !comment.trim()}
              onClick={() => decide.mutate({ submission, decision: "return", comment })}
            />
          </Box>
        </Box>
      )}
      {canCancel && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {!confirmCancel && (
            <Button
              disabled={blocked}
              text={EXECUTION_PLAN_COPY.CANCEL}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => setConfirmCancel(true)}
            />
          )}
          {confirmCancel && (
            <>
              <Button
                text="אישור ביטול"
                disabled={blocked || cancel.isPending}
                onClick={() => cancel.mutate(submission)}
              />
              <Button
                text="חזרה"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setConfirmCancel(false)}
              />
            </>
          )}
        </Box>
      )}
      {submission.status === EXECUTION_PLAN_STATUS.RETURNED &&
        submission.submittedById === user?.id && (
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text="בחר קובץ מעודכן להגשה חוזרת"
            onClick={() => navigate(projectPath)}
          />
        )}
      {error && <InlineError message={getApiErrorMessage(error)} />}
    </Box>
  );
};

const ExecutionPlanReviewCard: FC<IExecutionPlanReviewCardProps> = ({ quotationId, blocked }) => {
  const query = useQuotationExecutionPlansQuery(quotationId, true);

  if (query.isSuccess && query.data.length === 0) {
    return null;
  }

  return (
    <Box component="section" aria-label={EXECUTION_PLAN_COPY.REVIEW_TITLE}>
      <Card gap="16px">
        <CardHeader icon={ICON_NAMES.DOCUMENT} title={EXECUTION_PLAN_COPY.REVIEW_TITLE} />
        {query.isPending && <LoadingState label={EXECUTION_PLAN_COPY.LOADING} />}
        {query.isError && <InlineError message={getApiErrorMessage(query.error)} />}
        {query.data?.map(submission => (
          <ExecutionPlanReviewRow blocked={blocked} key={submission.id} submission={submission} />
        ))}
      </Card>
    </Box>
  );
};

export default ExecutionPlanReviewCard;
