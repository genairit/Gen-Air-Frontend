import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import type {
  TTaskFormErrors,
  ITaskFormValues,
  ITaskLinkOption,
} from "../../../interfaces/task.interface";

import type { FC } from "react";
import { Box } from "@mui/material";
import TaskTypeField from "./TaskTypeField";
import TaskLinkField from "./TaskLinkField";
import { useStyles } from "./TaskForm.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { POOL_ASSIGNEE_ID } from "../../../constants/task.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getAssigneeHint, toAssigneeOptions } from "../../../utilities/task.utility";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";

interface ITaskAssignmentCardProps {
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  onChange: (changes: Partial<ITaskFormValues>) => void;
  onLinkChange: (option: ITaskLinkOption | null) => void;
}

const TaskAssignmentCard: FC<ITaskAssignmentCardProps> = ({
  errors,
  values,
  onChange,
  onLinkChange,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const user = useSessionUser();
  const canAssign = hasPermission(user, PERMISSIONS.TASKS_ASSIGN);
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);

  const assigneeOptions = toAssigneeOptions(usersQuery.data ?? []);
  const assigneeHint = errors.assigneeOptionId ?? getAssigneeHint(values.assigneeOptionId);

  const changeAssignee = (label: string | null) =>
    onChange({ assigneeOptionId: findOptionIdByLabel(assigneeOptions, label) });

  const availableAssignees = canAssign
    ? assigneeOptions
    : assigneeOptions.filter(option => option.id === POOL_ASSIGNEE_ID);

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.BUILDING}
        title={NEW_TASK_COPY.ASSIGNMENT_TITLE}
        subtitle={NEW_TASK_COPY.ASSIGNMENT_SUBTITLE}
      />
      <TaskLinkField values={values} errors={errors} onChange={onLinkChange} />
      <TaskTypeField />
      <Box sx={pageStyles.stack({ gap: "6px" })}>
        <Autocomplete
          isRequired
          isAutocomplete={false}
          onChange={changeAssignee}
          title={NEW_TASK_COPY.ASSIGNEE}
          placeholder={NEW_TASK_COPY.CHOOSE_ASSIGNEE}
          options={getOptionLabels(availableAssignees)}
          value={findOptionLabelById(assigneeOptions, values.assigneeOptionId)}
        />
        {assigneeHint && (
          <Box component="span" sx={errors.assigneeOptionId ? styles.error : styles.hint}>
            {assigneeHint}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default TaskAssignmentCard;
