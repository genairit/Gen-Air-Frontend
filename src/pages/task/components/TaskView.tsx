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
import { type FC, useState } from "react";
import TaskHeaderCard from "./TaskHeaderCard";
import TaskUrgencyCard from "./TaskUrgencyCard";
import TaskDetailsCard from "./TaskDetailsCard";
import TaskHistoryCard from "./TaskHistoryCard";
import { usePageStyles } from "../../page.style";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { getTaskLinkName, formatUrgencyRecipient } from "../../../utilities/task.utility";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";

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
  const [confirmation, setConfirmation] = useState<IUrgencyConfirmation | null>(null);
  const statusMutation = useUpdateTaskStatusMutation();
  const urgencyMutation = useUpdateTaskUrgencyMutation();
  const updateMutation = useUpdateTaskMutation();
  const claimMutation = useClaimTaskMutation();

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
      <TaskHeaderCard
        task={task}
        canChangeStatus={canChangeStatus}
        onStatusChange={status => statusMutation.mutate({ taskId: task.id, status })}
      />
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
