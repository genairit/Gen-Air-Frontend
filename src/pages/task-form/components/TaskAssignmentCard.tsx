import {
  getAssigneeHint,
  formatAssigneeLabel,
  toProjectTaskAssigneeOptions,
} from "../../../utilities/task.utility";

import {
  NEW_TASK_COPY,
  TASKS_PAGE_COPY,
  TASK_ASSIGNEES_QUERY,
} from "../../../constants/task.constant";

import type {
  IApiTask,
  TTaskFormErrors,
  ITaskFormValues,
} from "../../../interfaces/task.interface";

import type { FC } from "react";
import { Box } from "@mui/material";
import TaskTypeField from "./TaskTypeField";
import { useStyles } from "./TaskForm.style";
import { usePageStyles } from "../../page.style";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { POOL_ASSIGNEE_ID } from "../../../constants/task.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";

interface ITaskAssignmentCardProps {
  canAssign: boolean;
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  existingTask?: IApiTask;
  project: IApiProject | null;
  onChange: (changes: Partial<ITaskFormValues>) => void;
}

const TaskAssignmentCard: FC<ITaskAssignmentCardProps> = ({
  errors,
  project,
  canAssign,
  existingTask,
  values,
  onChange,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);

  const assigneeOptions = toProjectTaskAssigneeOptions(
    usersQuery.data ?? [],
    project,
    existingTask?.assignee,
  );
  const items = assigneeOptions.map(({ id, ...option }) => ({ value: id, ...option }));
  const selectedItem = items.find(option => option.value === values.assigneeOptionId) ?? null;
  const unavailableAssignee =
    existingTask?.assignee &&
    selectedItem === null &&
    values.assigneeOptionId === existingTask.assigneeId;
  const assigneeHint = errors.assigneeOptionId ?? getAssigneeHint(values.assigneeOptionId);

  const changeAssignee = (assigneeOptionId: string | null) => onChange({ assigneeOptionId });

  const availableAssignees = canAssign
    ? items
    : items.filter(option => option.value === POOL_ASSIGNEE_ID);

  return (
    <Box sx={pageStyles.grid({ minColumnWidth: 200, gap: "16px" })}>
      <TaskTypeField
        value={values.taskType}
        disabled={existingTask != null}
        onChange={taskType => onChange({ taskType })}
      />
      <Box sx={pageStyles.stack({ gap: "6px" })}>
        <Autocomplete
          isRequired
          isAutocomplete={false}
          onChange={changeAssignee}
          items={availableAssignees}
          selectedItem={selectedItem}
          title={NEW_TASK_COPY.ASSIGNEE}
          value={selectedItem?.value ?? null}
          placeholder={NEW_TASK_COPY.CHOOSE_ASSIGNEE}
          disabled={existingTask != null && !canAssign}
        />
        {unavailableAssignee && (
          <Box component="span" sx={styles.hint}>
            {formatAssigneeLabel(existingTask)} · {TASKS_PAGE_COPY.UNAVAILABLE_ASSIGNEE}
          </Box>
        )}
        {assigneeHint && (
          <Box component="span" sx={errors.assigneeOptionId ? styles.error : styles.hint}>
            {assigneeHint}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TaskAssignmentCard;
