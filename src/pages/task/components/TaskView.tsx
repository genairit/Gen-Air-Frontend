import type {
  IApiTask,
  TUpdateTaskPayload,
  IUrgencyConfirmation,
} from "../../../interfaces/task.interface";

import {
  useClaimTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskUrgencyMutation,
} from "../../../hooks/mutations/task.mutation";

import { Box } from "@mui/material";
import TaskHeaderCard from "./TaskHeaderCard";
import TaskUrgencyCard from "./TaskUrgencyCard";
import TaskDetailsCard from "./TaskDetailsCard";
import TaskHistoryCard from "./TaskHistoryCard";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { type FC, lazy, Suspense, useState } from "react";
import { useSessionUser } from "../../../store/session.store";
import { TASK_STATUSES } from "../../../constants/task.constant";
import { TASK_TYPES } from "../../../constants/task-type.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { getTaskLinkName, formatUrgencyRecipient } from "../../../utilities/task.utility";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";

const QuotationEmailDialog = lazy(() => import("./quotation-email/QuotationEmailDialog"));

interface ITaskViewProps {
  task: IApiTask;
  canEdit: boolean;
  canClaim: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canChangeUrgency: boolean;
}

const TaskView: FC<ITaskViewProps> = ({
  task,
  canClaim,
  canEdit,
  canAssign,
  canChangeUrgency,
  canChangeStatus,
}) => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const [emailOpen, setEmailOpen] = useState(false);
  const canPrepareEmail =
    canChangeStatus &&
    Boolean(task.projectId) &&
    task.taskType === TASK_TYPES.QUOTATION &&
    [
      PERMISSIONS.TASKS_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.CUSTOMERS_READ,
      PERMISSIONS.DRIVE_READ,
    ].every(permission => hasPermission(sessionUser, permission));
  const [confirmation, setConfirmation] = useState<IUrgencyConfirmation | null>(null);
  const statusMutation = useUpdateTaskStatusMutation();
  const urgencyMutation = useUpdateTaskUrgencyMutation();
  const updateMutation = useUpdateTaskMutation();
  const claimMutation = useClaimTaskMutation();
  const changeStatus = (status: typeof task.status) =>
    statusMutation.mutate(
      { taskId: task.id, status },
      {
        onSuccess: () => {
          if (status === TASK_STATUSES.PROPOSAL_SENT && canPrepareEmail) setEmailOpen(true);
        },
      },
    );

  const mutationError =
    statusMutation.error ?? urgencyMutation.error ?? updateMutation.error ?? claimMutation.error;

  const requestUrgencyChange = () =>
    setConfirmation({
      isBeforeSave: false,
      taskTitle: task.title,
      kind: task.isUrgent ? "clear" : "set",
      recipient: formatUrgencyRecipient(task.assignee),
    });

  const confirmUrgencyChange = () =>
    urgencyMutation.mutateAsync({ taskId: task.id, isUrgent: !task.isUrgent });

  const updateTask = (payload: TUpdateTaskPayload) =>
    updateMutation.mutate({ taskId: task.id, payload });

  return (
    <Box sx={styles.page}>
      <TaskHeaderCard task={task} onStatusChange={changeStatus} canChangeStatus={canChangeStatus} />
      {canPrepareEmail && task.status === TASK_STATUSES.PROPOSAL_SENT && (
        <Button text="שליחת תוכנית לביצוע במייל" onClick={() => setEmailOpen(true)} />
      )}
      {emailOpen && (
        <Suspense fallback={<LoadingState label="טוען חלון מייל" />}>
          <QuotationEmailDialog taskId={task.id} onClose={() => setEmailOpen(false)} />
        </Suspense>
      )}
      <TaskUrgencyCard
        task={task}
        isManager={canChangeUrgency}
        onRequestChange={requestUrgencyChange}
      />
      {mutationError && <InlineError message={getApiErrorMessage(mutationError)} />}
      <TaskDetailsCard
        task={task}
        canEdit={canEdit}
        canClaim={canClaim}
        onUpdate={updateTask}
        canAssign={canAssign}
        isSaving={updateMutation.isPending}
        onClaim={() => claimMutation.mutate(task.id)}
      />
      <TaskHistoryCard taskId={task.id} />
      <UrgencyConfirmPopup
        confirmation={confirmation}
        onConfirm={confirmUrgencyChange}
        detailLine={getTaskLinkName(task)}
        onClose={() => setConfirmation(null)}
      />
    </Box>
  );
};

export default TaskView;
