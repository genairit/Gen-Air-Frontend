import {
  type TaskType,
  TASK_TYPE_LABELS,
  TASK_TYPE_VALUES,
} from "../../../constants/task-type.constant";

import type { FC } from "react";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";

interface ITaskTypeFieldProps {
  value: TaskType;
  disabled?: boolean;
  onChange: (type: TaskType) => void;
}

const TaskTypeField: FC<ITaskTypeFieldProps> = ({ value, onChange, disabled = false }) => {
  return (
    <Autocomplete
      isRequired
      disabled={disabled}
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
  );
};
export default TaskTypeField;
