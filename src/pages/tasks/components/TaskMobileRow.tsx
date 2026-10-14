import {
  formatTaskContext,
  formatTaskDueShort,
  formatAssigneeLabel,
} from "../../../utilities/task.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import { TASK_COLUMN_STYLES } from "../columns/task-columns.style";
import type { IApiTask } from "../../../interfaces/task.interface";
import TaskStatusChip from "../../../components/TaskStatusChip/TaskStatusChip";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";

interface ITaskMobileRowProps {
  task: IApiTask;
  onOpen: (task: IApiTask) => void;
}

const TaskMobileRow: FC<ITaskMobileRowProps> = ({ task, onOpen }) => (
  <Card gap="10px" padding="16px" onClick={() => onOpen(task)}>
    <Box sx={TASK_COLUMN_STYLES.mobileRow}>
      <Box component="b" sx={TASK_COLUMN_STYLES.title}>
        {task.title}
      </Box>
      {task.isUrgent && <TaskUrgentChip />}
    </Box>
    <Box component="span" sx={TASK_COLUMN_STYLES.caption}>
      {formatTaskContext(task)}
    </Box>
    <Box sx={TASK_COLUMN_STYLES.mobileRow}>
      <TaskStatusChip status={task.status} />
      <Box component="span" sx={TASK_COLUMN_STYLES.caption}>
        {`${formatAssigneeLabel(task)} · ${formatTaskDueShort(task)}`}
      </Box>
    </Box>
  </Card>
);

export default TaskMobileRow;
