import type { FC } from "react";
import { useState } from "react";
import TaskFormDialog from "./TaskFormDialog";
import TaskAssignmentCard from "./TaskAssignmentCard";
import type { IEditTaskFormProps } from "./TaskFormPopup";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import { getTaskLinkName } from "../../../utilities/task.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { useProjectQuery } from "../../../hooks/queries/project.query";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { ITaskFormValues } from "../../../interfaces/task.interface";
import { useUpdateTaskMutation } from "../../../hooks/mutations/task.mutation";
import { getTaskEdit, toTaskEditValues } from "../../../utilities/task-form.utility";

const EditTaskForm: FC<IEditTaskFormProps> = ({ task, canEdit, canAssign, onClose }) => {
  const [initialValues] = useState(() => toTaskEditValues(task));
  const [values, setValues] = useState(initialValues);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const projectQuery = useProjectQuery(task.projectId);
  const mutation = useUpdateTaskMutation();
  const { changes, errors } = getTaskEdit({ values, initialValues, canEdit, canAssign });
  const hasChanges = Object.keys(changes).length > 0;
  const updateValues = (patch: Partial<ITaskFormValues>) =>
    setValues(current => ({ ...current, ...patch }));
  const submit = () => {
    setSubmitAttempted(true);
    if (!hasChanges || mutation.isPending || Object.keys(errors).length > 0) {
      return;
    }

    mutation.mutate({ taskId: task.id, payload: changes }, { onSuccess: onClose });
  };

  return (
    <TaskFormDialog
      values={values}
      onClose={onClose}
      onSubmit={submit}
      onChange={updateValues}
      canEditContent={canEdit}
      saveDisabled={!hasChanges}
      isPending={mutation.isPending}
      context={getTaskLinkName(task)}
      title={NEW_TASK_COPY.EDIT_TITLE}
      saveLabel={NEW_TASK_COPY.SAVE_EDIT}
      errors={submitAttempted ? errors : {}}
    >
      <TaskAssignmentCard
        values={values}
        existingTask={task}
        canAssign={canAssign}
        onChange={updateValues}
        project={projectQuery.data ?? null}
        errors={submitAttempted ? errors : {}}
      />
      {mutation.isError && <InlineError message={getApiErrorMessage(mutation.error)} />}
    </TaskFormDialog>
  );
};

export default EditTaskForm;
