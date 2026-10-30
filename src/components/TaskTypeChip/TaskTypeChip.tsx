import {
  type TaskType,
  TASK_TYPE_LABELS,
  TASK_TYPE_CHIP_VARIANTS,
} from "../../constants/task-type.constant";

import type { FC } from "react";
import Chip from "../Chip/Chip";
import { CHIP_SIZES } from "../../constants/chip.constant";

interface ITaskTypeChipProps {
  taskType: TaskType;
}
const TaskTypeChip: FC<ITaskTypeChipProps> = ({ taskType }) => (
  <Chip
    size={CHIP_SIZES.SMALL}
    label={TASK_TYPE_LABELS[taskType]}
    variant={TASK_TYPE_CHIP_VARIANTS[taskType]}
  />
);
export default TaskTypeChip;
