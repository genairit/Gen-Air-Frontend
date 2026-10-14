import type { FC } from "react";
import Chip from "../Chip/Chip";
import { ICON_NAMES } from "../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../constants/chip.constant";
import { TASKS_PAGE_COPY } from "../../constants/task.constant";

const TaskUrgentChip: FC = () => (
  <Chip icon={ICON_NAMES.URGENT} variant={CHIP_VARIANTS.DARK} label={TASKS_PAGE_COPY.URGENT_CHIP} />
);

export default TaskUrgentChip;
