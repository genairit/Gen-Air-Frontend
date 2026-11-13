import {
  findTaskAssignee,
  getTaskFormErrors,
  toCreateTaskPayload,
  countTaskFormErrors,
  formatUrgencyRecipient,
  toInitialTaskFormValues,
  resolveAssigneeAfterProjectChange,
} from "../../../utilities/task.utility";

import type {
  ITaskFormValues,
  ITaskLinkOption,
  IUrgencyConfirmation,
} from "../../../interfaces/task.interface";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskContentCard from "./TaskContentCard";
import { usePageStyles } from "../../page.style";
import TaskAssignmentCard from "./TaskAssignmentCard";
import Button from "../../../components/Button/Button";
import TaskUrgencyChoiceCard from "./TaskUrgencyChoiceCard";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { buildTaskPath } from "../../../utilities/route.utility";
import { useStyles as useTaskFormStyles } from "./TaskForm.style";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { buildProjectPath } from "../../../utilities/route.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { useProjectQuery } from "../../../hooks/queries/project.query";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCreateTaskMutation } from "../../../hooks/mutations/task.mutation";
import { useProjectProtectedTasksQuery } from "../../../hooks/queries/task.query";
import { TASK_TYPES, type TaskType } from "../../../constants/task-type.constant";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";

interface INewTaskFormProps {
  initialTaskType: TaskType;
  initialProjectId: string | null;
}

const NewTaskForm: FC<INewTaskFormProps> = ({ initialProjectId, initialTaskType }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const taskFormStyles = useTaskFormStyles();
  const [values, setValues] = useState<ITaskFormValues>(() => ({
    ...toInitialTaskFormValues(null),
    projectId: initialProjectId,
    taskType: initialTaskType,
  }));
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<IUrgencyConfirmation | null>(null);
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);
  const createMutation = useCreateTaskMutation();
  const selectedProjectQuery = useProjectQuery(values.projectId);
  const isProtected = values.taskType !== TASK_TYPES.GENERAL;
  const slotProjectId = isProtected && selectedProjectQuery.isSuccess ? values.projectId : null;
  const slotsQuery = useProjectProtectedTasksQuery(slotProjectId);
  const existingSlot = slotsQuery.data?.find(slot => slot.taskType === values.taskType) ?? null;
  const slotLookupUnavailable = isProtected && (slotsQuery.isPending || slotsQuery.isError);
  const linkName = selectedProjectQuery.data?.name ?? "";
  const isProjectUnavailable = values.projectId !== null && !selectedProjectQuery.isSuccess;
  const cancelPath = initialProjectId ? buildProjectPath(initialProjectId) : ROUTE_PATHS.BOARD;

  const errors = isSubmitAttempted ? getTaskFormErrors(values) : {};
  const errorCount = isSubmitAttempted ? countTaskFormErrors(values) : 0;
  const assignee = findTaskAssignee(
    usersQuery.data ?? [],
    selectedProjectQuery.data,
    values.assigneeOptionId,
  );
  const recipient = formatUrgencyRecipient(assignee);
  const saveLabel = values.isUrgent ? NEW_TASK_COPY.SAVE_URGENT : NEW_TASK_COPY.SAVE;

  const updateValues = (changes: Partial<ITaskFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const changeLink = (option: ITaskLinkOption | null) => {
    const nextProjectId = option?.id ?? null;
    updateValues({
      projectId: nextProjectId,
      assigneeOptionId: resolveAssigneeAfterProjectChange({
        currentProjectId: values.projectId,
        nextProjectId,
        assigneeOptionId: values.assigneeOptionId,
        availableUsers: usersQuery.data ?? [],
      }),
    });
  };

  const createTask = () => {
    const payload = toCreateTaskPayload(values);

    if (!payload || existingSlot || slotLookupUnavailable) {
      return;
    }

    createMutation.mutate(
      { payload, isUrgent: values.isUrgent },
      {
        onSuccess: taskId => navigate(buildTaskPath(taskId)),
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

    if (
      countTaskFormErrors(values) > 0 ||
      isProjectUnavailable ||
      existingSlot ||
      slotLookupUnavailable
    ) {
      return;
    }

    if (!values.isUrgent) {
      createTask();

      return;
    }

    setConfirmation({ kind: "set", recipient, isBeforeSave: true, taskTitle: values.title });
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.grid({ minColumnWidth: 500 })}>
        <TaskAssignmentCard
          errors={errors}
          values={values}
          onChange={updateValues}
          onLinkChange={changeLink}
          project={selectedProjectQuery.data ?? null}
        />
        <TaskContentCard errors={errors} values={values} onChange={updateValues} />
      </Box>
      <TaskUrgencyChoiceCard
        recipient={recipient}
        detailLine={linkName}
        taskTitle={values.title}
        isUrgent={values.isUrgent}
        onChange={isUrgent => updateValues({ isUrgent })}
      />
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
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
        <InlineError message={NEW_TASK_COPY.PROTECTED_LOOKUP_FAILED} />
      )}
      {createMutation.isError && <InlineError message={getApiErrorMessage(createMutation.error)} />}
      <Box sx={taskFormStyles.footerActions}>
        <Button
          text={saveLabel}
          icon={ICON_NAMES.SAVE}
          onClick={handleSubmit}
          isLoading={createMutation.isPending}
          disabled={isProjectUnavailable || existingSlot !== null || slotLookupUnavailable}
        />
        <Button
          text={NEW_TASK_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(cancelPath)}
        />
      </Box>
      <UrgencyConfirmPopup
        detailLine={linkName}
        onConfirm={createTask}
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </Box>
  );
};

export default NewTaskForm;
