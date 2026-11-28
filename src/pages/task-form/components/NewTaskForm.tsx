import {
  findTaskAssignee,
  getTaskFormErrors,
  toCreateTaskPayload,
  countTaskFormErrors,
  formatUrgencyRecipient,
  toInitialTaskFormValues,
} from "../../../utilities/task.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import TaskFormDialog from "./TaskFormDialog";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import TaskAssignmentCard from "./TaskAssignmentCard";
import Button from "../../../components/Button/Button";
import TaskUrgencyRetryPopup from "./TaskUrgencyRetryPopup";
import type { ICreateTaskFormProps } from "./TaskFormPopup";
import TaskUrgencyChoiceCard from "./TaskUrgencyChoiceCard";
import { useSessionUser } from "../../../store/session.store";
import { buildTaskPath } from "../../../utilities/route.utility";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { TASK_TYPES } from "../../../constants/task-type.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCreateTaskMutation } from "../../../hooks/mutations/task.mutation";
import { useProjectProtectedTasksQuery } from "../../../hooks/queries/task.query";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";
import type { ITaskFormValues, IUrgencyConfirmation } from "../../../interfaces/task.interface";

const NewTaskForm: FC<ICreateTaskFormProps> = ({
  project,
  initialTaskType,
  onClose,
  onCreated,
}) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const user = useSessionUser();
  const canAssign = hasPermission(user, PERMISSIONS.TASKS_ASSIGN);
  const [values, setValues] = useState<ITaskFormValues>(() => ({
    ...toInitialTaskFormValues(project),
    taskType: initialTaskType,
  }));
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<IUrgencyConfirmation | null>(null);
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);
  const createMutation = useCreateTaskMutation();
  const isProtected = values.taskType !== TASK_TYPES.GENERAL;
  const slotProjectId = isProtected ? project.id : null;
  const slotsQuery = useProjectProtectedTasksQuery(slotProjectId);
  const existingSlot = slotsQuery.data?.find(slot => slot.taskType === values.taskType) ?? null;
  const slotLookupUnavailable = isProtected && (slotsQuery.isPending || slotsQuery.isError);
  const errors = isSubmitAttempted ? getTaskFormErrors(values) : {};
  const assignee = findTaskAssignee(usersQuery.data ?? [], project, values.assigneeOptionId);
  const recipient = formatUrgencyRecipient(assignee);
  const saveLabel = values.isUrgent ? NEW_TASK_COPY.SAVE_URGENT : NEW_TASK_COPY.SAVE;

  const saveDisabled = createMutation.isPending || existingSlot !== null || slotLookupUnavailable;
  const updateValues = (changes: Partial<Omit<ITaskFormValues, "projectId">>) =>
    setValues(current => ({ ...current, ...changes }));

  const createTask = () => {
    const payload = toCreateTaskPayload({ ...values, projectId: project.id });

    if (!payload || saveDisabled) {
      return;
    }

    createMutation.mutate(
      { payload, isUrgent: values.isUrgent },
      {
        onSuccess: ({ taskId, urgencyError }) => {
          if (urgencyError === null) {
            onCreated(taskId);
          }
        },
        onError: async () => {
          if (isProtected) {
            await slotsQuery.refetch();
          }
        },
      },
    );
  };

  const handleSubmit = () => {
    setIsSubmitAttempted(true);

    if (countTaskFormErrors(values) > 0 || saveDisabled) {
      return;
    }

    if (!values.isUrgent) {
      createTask();

      return;
    }

    setConfirmation({ kind: "set", recipient, isBeforeSave: true, taskTitle: values.title });
  };

  const savedTask = createMutation.data;
  if (savedTask && savedTask.urgencyError !== null) {
    return (
      <TaskUrgencyRetryPopup
        taskId={savedTask.taskId}
        error={savedTask.urgencyError}
        onFinish={() => onCreated(savedTask.taskId)}
      />
    );
  }

  return (
    <>
      <TaskFormDialog
        canEditContent
        values={values}
        errors={errors}
        onClose={onClose}
        saveLabel={saveLabel}
        context={project.name}
        onChange={updateValues}
        onSubmit={handleSubmit}
        title={NEW_TASK_COPY.TITLE}
        saveDisabled={saveDisabled}
        isPending={createMutation.isPending}
      >
        <TaskAssignmentCard
          errors={errors}
          values={values}
          project={project}
          canAssign={canAssign}
          onChange={updateValues}
        />
        <TaskUrgencyChoiceCard
          recipient={recipient}
          taskTitle={values.title}
          detailLine={project.name}
          isUrgent={values.isUrgent}
          onChange={isUrgent => updateValues({ isUrgent })}
        />
        {existingSlot && (
          <Box sx={styles.stack({ gap: "8px" })}>
            <InlineError message={NEW_TASK_COPY.EXISTING_TYPE} />
            {existingSlot.available && (
              <Button
                variant={BUTTON_VARIANTS.NEUTRAL}
                text={NEW_TASK_COPY.OPEN_EXISTING}
                onClick={() => navigate(buildTaskPath(existingSlot.id))}
              />
            )}
          </Box>
        )}
        {isProtected && slotsQuery.isPending && (
          <Box sx={styles.caption}>{NEW_TASK_COPY.CHECKING_EXISTING}</Box>
        )}
        {isProtected && slotsQuery.isError && (
          <Box sx={styles.row({ gap: "8px" })}>
            <InlineError message={NEW_TASK_COPY.PROTECTED_LOOKUP_FAILED} />
            <Button
              text={NEW_TASK_COPY.RETRY}
              disabled={slotsQuery.isFetching}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={async () => {
                await slotsQuery.refetch();
              }}
            />
          </Box>
        )}
        {createMutation.isError && (
          <InlineError message={getApiErrorMessage(createMutation.error)} />
        )}
      </TaskFormDialog>
      <UrgencyConfirmPopup
        onConfirm={createTask}
        detailLine={project.name}
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </>
  );
};

export default NewTaskForm;
