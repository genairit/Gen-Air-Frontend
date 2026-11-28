import {
  canClaimTask,
  formatAssigneeLabel,
  getAssigneeInitials,
} from "../../../utilities/task.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskPanels.style";
import Avatar from "../../../components/Avatar/Avatar";
import Button from "../../../components/Button/Button";
import type { IApiTask } from "../../../interfaces/task.interface";
import { TASKS_PAGE_COPY } from "../../../constants/task.constant";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";

interface ITaskAssigneeFieldProps {
  task: IApiTask;
  canClaim: boolean;
  onClaim: () => void;
}

const TaskAssigneeField: FC<ITaskAssigneeFieldProps> = ({ task, onClaim, canClaim }) => {
  const styles = useStyles();
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
