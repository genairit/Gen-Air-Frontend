import type { FC } from "react";
import { Box } from "@mui/material";
import { TASK_COLUMN_STYLES } from "../task-columns.style";
import type { IApiTask } from "../../../../interfaces/task.interface";
import { isTaskOverdue, formatTaskDueShort } from "../../../../utilities/task.utility";

interface ITaskDueCellProps {
  task: IApiTask;
}

const TaskDueCell: FC<ITaskDueCellProps> = ({ task }) => (
  <Box component="span" sx={TASK_COLUMN_STYLES.due(isTaskOverdue(task))}>
    {formatTaskDueShort(task)}
  </Box>
);

export default TaskDueCell;
