import type { FC } from "react";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { NEW_TASK_COPY, PROJECT_TASKS_COPY } from "../../../constants/task.constant";
import { useUpdateTaskUrgencyMutation } from "../../../hooks/mutations/task.mutation";

interface ITaskUrgencyRetryPopupProps {
  error: string;
  taskId: string;
  onFinish: () => void;
}

const TaskUrgencyRetryPopup: FC<ITaskUrgencyRetryPopupProps> = ({ taskId, error, onFinish }) => {
  const user = useSessionUser();
  const mutation = useUpdateTaskUrgencyMutation();
  const canRetry = hasPermission(user, PERMISSIONS.TASKS_URGENCY_CHANGE) && !mutation.isPending;
  const retry = () => {
    if (canRetry) {
      mutation.mutate({ taskId, isUrgent: true }, { onSuccess: onFinish });
    }
  };

  return (
    <GenericPopup
      open
      align="right"
      onClose={onFinish}
      closeAfterAction={false}
      dir={TEXT_DIRECTIONS.RTL}
      title={PROJECT_TASKS_COPY.CREATED}
      closeDisabled={mutation.isPending}
      guidelines={NEW_TASK_COPY.URGENCY_UNCONFIRMED}
      content={
        <InlineError message={mutation.isError ? getApiErrorMessage(mutation.error) : error} />
      }
      buttons={{
        primary: { text: NEW_TASK_COPY.RETRY_URGENCY, onClick: retry, isDisabled: !canRetry },
        secondary: {
          text: NEW_TASK_COPY.BACK_TO_PROJECT,
          onClick: onFinish,
          isDisabled: mutation.isPending,
        },
      }}
    />
  );
};

export default TaskUrgencyRetryPopup;
