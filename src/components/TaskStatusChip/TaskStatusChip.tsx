import {
  TASK_STATUS_LABELS,
  type TaskStatusType,
  TASK_STATUS_DOT_COLORS,
} from "../../constants/task.constant";

import type { FC } from "react";
import Chip from "../Chip/Chip";

interface ITaskStatusChipProps {
  status: TaskStatusType;
}

const TaskStatusChip: FC<ITaskStatusChipProps> = ({ status }) => (
  <Chip label={TASK_STATUS_LABELS[status]} dotColor={TASK_STATUS_DOT_COLORS[status]} />
);

export default TaskStatusChip;
