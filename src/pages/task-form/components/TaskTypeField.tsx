import {
  type TaskType,
  TASK_TYPE_LABELS,
  TASK_TYPE_VALUES,
  PROJECT_TASK_COPY,
} from "../../../constants/task-type.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import TaskTypeChip from "../../../components/TaskTypeChip/TaskTypeChip";

interface ITaskTypeFieldProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
}

const TaskTypeField: FC<ITaskTypeFieldProps> = ({ value, onChange }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.context}>
      <Autocomplete
        isRequired
        isAutocomplete={false}
        title={NEW_TASK_COPY.TASK_TYPE}
        value={TASK_TYPE_LABELS[value]}
        options={TASK_TYPE_VALUES.map(type => TASK_TYPE_LABELS[type])}
        onChange={label => {
          const type = TASK_TYPE_VALUES.find(item => TASK_TYPE_LABELS[item] === label);
          if (type) {
            onChange(type);
          }
        }}
      />
      <TaskTypeChip taskType={value} />
      <Box component="span">{PROJECT_TASK_COPY.GENERAL_HELP}</Box>
    </Box>
  );
};
export default TaskTypeField;
