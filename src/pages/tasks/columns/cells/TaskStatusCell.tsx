import {
  TASK_STATUS_LABELS,
  type TaskStatusType,
  TASK_STATUS_OPTION_LABELS,
} from "../../../../constants/task.constant";

import { Box } from "@mui/material";
import type { FC, MouseEvent } from "react";
import { TASK_COLUMN_STYLES } from "../task-columns.style";
import type { IApiTask } from "../../../../interfaces/task.interface";
import { findTaskStatusByLabel } from "../../../../utilities/task.utility";
import Autocomplete from "../../../../components/Autocomplete/Autocomplete";

interface ITaskStatusCellProps {
  task: IApiTask;
  onChange: (task: IApiTask, status: TaskStatusType) => void;
}

const stopRowClick = (event: MouseEvent) => event.stopPropagation();

const TaskStatusCell: FC<ITaskStatusCellProps> = ({ task, onChange }) => {
  const changeStatus = (label: string | null) => {
    const status = findTaskStatusByLabel(label);

    if (!status || status === task.status) {
      return;
    }

    onChange(task, status);
  };

  return (
    <Box onClick={stopRowClick} sx={TASK_COLUMN_STYLES.stopper}>
      <Autocomplete
        isAutocomplete={false}
        onChange={changeStatus}
        options={TASK_STATUS_OPTION_LABELS}
        value={TASK_STATUS_LABELS[task.status]}
      />
    </Box>
  );
};

export default TaskStatusCell;
