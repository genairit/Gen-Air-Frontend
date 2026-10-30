import {
  getTaskFormErrors,
  toCreateTaskPayload,
  countTaskFormErrors,
  formatUrgencyRecipient,
  toInitialTaskFormValues,
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
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { buildProjectPath } from "../../../utilities/route.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { useProjectQuery } from "../../../hooks/queries/project.query";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCreateTaskMutation } from "../../../hooks/mutations/task.mutation";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import UrgencyConfirmPopup from "../../../components/UrgencyConfirmPopup/UrgencyConfirmPopup";

interface INewTaskFormProps {
  initialProjectId: string | null;
  initialProject: IApiProject | null;
}

const NewTaskForm: FC<INewTaskFormProps> = ({ initialProject, initialProjectId }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const [values, setValues] = useState<ITaskFormValues>(() => ({
    ...toInitialTaskFormValues(initialProject),
    projectId: initialProject?.id ?? initialProjectId,
  }));
  const [linkName, setLinkName] = useState(initialProject?.name ?? "");
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<IUrgencyConfirmation | null>(null);
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);
  const createMutation = useCreateTaskMutation();
  const selectedProjectQuery = useProjectQuery(values.projectId);
  const isProjectUnavailable = Boolean(values.projectId) && !selectedProjectQuery.isSuccess;
  const cancelPath = initialProjectId ? buildProjectPath(initialProjectId) : ROUTE_PATHS.BOARD;

  const errors = isSubmitAttempted ? getTaskFormErrors(values) : {};
  const errorCount = isSubmitAttempted ? countTaskFormErrors(values) : 0;
  const assignee = (usersQuery.data ?? []).find(user => user.id === values.assigneeOptionId);
  const recipient = formatUrgencyRecipient(assignee);
  const saveLabel = values.isUrgent ? NEW_TASK_COPY.SAVE_URGENT : NEW_TASK_COPY.SAVE;

  const updateValues = (changes: Partial<ITaskFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const changeLink = (option: ITaskLinkOption | null) => {
    setLinkName(option?.name ?? "");
    updateValues({ projectId: option?.id ?? null });
  };

  const createTask = () => {
    const payload = toCreateTaskPayload(values);

    if (!payload) {
      return;
    }

    createMutation.mutate(
      { payload, isUrgent: values.isUrgent },
      { onSuccess: taskId => navigate(buildTaskPath(taskId)) },
    );
  };

  const handleSubmit = () => {
    setIsSubmitAttempted(true);

    if (countTaskFormErrors(values) > 0 || isProjectUnavailable) {
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
      <TaskAssignmentCard
        errors={errors}
        values={values}
        onChange={updateValues}
        onLinkChange={changeLink}
      />
      <TaskContentCard errors={errors} values={values} onChange={updateValues} />
      <TaskUrgencyChoiceCard
        recipient={recipient}
        detailLine={linkName}
        taskTitle={values.title}
        isUrgent={values.isUrgent}
        onChange={isUrgent => updateValues({ isUrgent })}
      />
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
      {createMutation.isError && <InlineError message={getApiErrorMessage(createMutation.error)} />}
      <Box sx={styles.row({})}>
        <Button
          text={saveLabel}
          icon={ICON_NAMES.SAVE}
          onClick={handleSubmit}
          disabled={isProjectUnavailable}
          isLoading={createMutation.isPending}
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
