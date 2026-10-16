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
import { formatUrgencyRecipient } from "../../../utilities/task.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";

interface ITaskViewProps {
  task: IApiTask;
  isManager: boolean;
}

const TaskView: FC<ITaskViewProps> = ({ task, isManager }) => {
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
        onStatusChange={status => statusMutation.mutate({ taskId: task.id, status })}
      />
      <TaskUrgencyCard task={task} isManager={isManager} onRequestChange={requestUrgencyChange} />
      {mutationError && <InlineError message={getApiErrorMessage(mutationError)} />}
      <TaskDetailsCard
        task={task}
        onUpdate={updateTask}
        isManager={isManager}
        isSaving={updateMutation.isPending}
        onClaim={() => claimMutation.mutate(task.id)}
      />
      <TaskHistoryCard taskId={task.id} />
      <UrgencyConfirmPopup
        confirmation={confirmation}
        onConfirm={confirmUrgencyChange}
        onClose={() => setConfirmation(null)}
        detailLine={task.project?.name ?? ""}
      />
    </Box>
  );
};

export default TaskView;
