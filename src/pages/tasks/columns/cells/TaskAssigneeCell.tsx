import { Box } from "@mui/material";
import type { FC, MouseEvent } from "react";
import Avatar from "../../../../components/Avatar/Avatar";
import Button from "../../../../components/Button/Button";
import { TASK_COLUMN_STYLES } from "../task-columns.style";
import type { IApiTask } from "../../../../interfaces/task.interface";
import { TASKS_PAGE_COPY } from "../../../../constants/task.constant";
import { BUTTON_SIZES } from "../../../../components/Button/constants/button.constants";
import { formatAssigneeLabel, getAssigneeInitials } from "../../../../utilities/task.utility";

interface ITaskAssigneeCellProps {
  task: IApiTask;
  canClaim: boolean;
  onClaim: (task: IApiTask) => void;
}

const TaskAssigneeCell: FC<ITaskAssigneeCellProps> = ({ task, canClaim, onClaim }) => {
  const claim = (event: MouseEvent) => {
    event.stopPropagation();
    onClaim(task);
  };

  return (
    <Box sx={TASK_COLUMN_STYLES.assignee}>
      <Avatar size={32} initials={getAssigneeInitials(task)} />
      <Box component="span" sx={TASK_COLUMN_STYLES.assigneeName(!task.assignee)}>
        {formatAssigneeLabel(task)}
      </Box>
      {canClaim && (
        <Button onClick={claim} size={BUTTON_SIZES.COMPACT} text={TASKS_PAGE_COPY.CLAIM} />
      )}
    </Box>
  );
};

export default TaskAssigneeCell;
