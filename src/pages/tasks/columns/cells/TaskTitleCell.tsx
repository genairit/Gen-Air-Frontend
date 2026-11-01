import type { FC } from "react";
import { Box } from "@mui/material";
import { TASK_COLUMN_STYLES } from "../task-columns.style";
import TaskLinkCaption from "../../components/TaskLinkCaption";
import type { IApiTask } from "../../../../interfaces/task.interface";
import TaskTypeChip from "../../../../components/TaskTypeChip/TaskTypeChip";

interface ITaskTitleCellProps {
  task: IApiTask;
}

const TaskTitleCell: FC<ITaskTitleCellProps> = ({ task }) => (
  <Box sx={TASK_COLUMN_STYLES.cell}>
    <Box component="b" sx={TASK_COLUMN_STYLES.title}>
      {task.title}
    </Box>
    <TaskTypeChip taskType={task.taskType} />
    <TaskLinkCaption task={task} />
  </Box>
);

export default TaskTitleCell;
