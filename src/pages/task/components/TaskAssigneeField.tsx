import {
  toAssigneeId,
  canClaimTask,
  toAssigneeOptionId,
  formatAssigneeLabel,
  getAssigneeInitials,
  toProjectTaskAssigneeOptions,
} from "../../../utilities/task.utility";

import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskPanels.style";
import Avatar from "../../../components/Avatar/Avatar";
import Button from "../../../components/Button/Button";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import type { IApiTask } from "../../../interfaces/task.interface";
import { useProjectQuery } from "../../../hooks/queries/project.query";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";
import { TASKS_PAGE_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";

interface ITaskAssigneeFieldProps {
  task: IApiTask;
  canClaim: boolean;
  isManager: boolean;
  onClaim: () => void;
  onAssign: (assigneeId: string | null) => void;
}

const TaskAssigneeField: FC<ITaskAssigneeFieldProps> = ({
  task,
  onClaim,
  canClaim,
  onAssign,
  isManager,
}) => {
  const styles = useStyles();
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);
  const projectQuery = useProjectQuery(task.projectId);
  const options = toProjectTaskAssigneeOptions(
    usersQuery.data ?? [],
    projectQuery.data,
    task.assignee,
  );
  const selectedLabel = findOptionLabelById(options, toAssigneeOptionId(task.assigneeId));

  const assign = (label: string | null) => {
    const optionId = findOptionIdByLabel(options, label);

    if (!optionId) {
      return;
    }

    onAssign(toAssigneeId(optionId));
  };

  if (isManager) {
    return (
      <Box>
        <Autocomplete
          onChange={assign}
          value={selectedLabel}
          isAutocomplete={false}
          options={getOptionLabels(options)}
        />
        {!selectedLabel && task.assignee && (
          <Box component="span">
            {formatAssigneeLabel(task)} · {TASKS_PAGE_COPY.UNAVAILABLE_ASSIGNEE}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={styles.assignee}>
      <Avatar size={32} initials={getAssigneeInitials(task)} />
      <Box component="b" sx={styles.value}>
        {formatAssigneeLabel(task)}
      </Box>
      {canClaimTask(task, canClaim) && (
        <Button onClick={onClaim} size={BUTTON_SIZES.COMPACT} text={TASKS_PAGE_COPY.CLAIM} />
      )}
    </Box>
  );
};

export default TaskAssigneeField;
