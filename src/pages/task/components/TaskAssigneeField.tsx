import {
  toAssigneeId,
  canClaimTask,
  toAssigneeOptions,
  toAssigneeOptionId,
  formatAssigneeLabel,
  getAssigneeInitials,
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
import { TASKS_PAGE_COPY } from "../../../constants/task.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { ALL_USERS_QUERY } from "../../../constants/project-form.constant";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";

interface ITaskAssigneeFieldProps {
  task: IApiTask;
  isManager: boolean;
  onClaim: () => void;
  onAssign: (assigneeId: string | null) => void;
}

const TaskAssigneeField: FC<ITaskAssigneeFieldProps> = ({ task, isManager, onClaim, onAssign }) => {
  const styles = useStyles();
  const usersQuery = useUsersQuery(ALL_USERS_QUERY);
  const options = toAssigneeOptions(usersQuery.data ?? []);

  const assign = (label: string | null) => {
    const optionId = findOptionIdByLabel(options, label);

    if (!optionId) {
      return;
    }

    onAssign(toAssigneeId(optionId));
  };

  if (isManager) {
    return (
      <Autocomplete
        onChange={assign}
        isAutocomplete={false}
        options={getOptionLabels(options)}
        value={findOptionLabelById(options, toAssigneeOptionId(task.assigneeId))}
      />
    );
  }

  return (
    <Box sx={styles.assignee}>
      <Avatar size={32} initials={getAssigneeInitials(task)} />
      <Box component="b" sx={styles.value}>
        {formatAssigneeLabel(task)}
      </Box>
      {canClaimTask(task, isManager) && (
        <Button onClick={onClaim} size={BUTTON_SIZES.COMPACT} text={TASKS_PAGE_COPY.CLAIM} />
      )}
    </Box>
  );
};

export default TaskAssigneeField;
