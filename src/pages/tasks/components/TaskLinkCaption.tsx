import {
  getTaskLinkKind,
  getTaskLinkName,
  formatTaskLinkContext,
} from "../../../utilities/task.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import { TASK_COLUMN_STYLES } from "../columns/task-columns.style";
import type { IApiTask } from "../../../interfaces/task.interface";
import { TASK_LINK_KIND_LABELS, TASK_LINK_CHIP_VARIANTS } from "../../../constants/task.constant";

interface ITaskLinkCaptionProps {
  task: IApiTask;
}

const TaskLinkCaption: FC<ITaskLinkCaptionProps> = ({ task }) => {
  const linkKind = getTaskLinkKind(task);

  return (
    <Box component="span" sx={TASK_COLUMN_STYLES.linkCaption}>
      <Chip
        size={CHIP_SIZES.SMALL}
        label={TASK_LINK_KIND_LABELS[linkKind]}
        variant={TASK_LINK_CHIP_VARIANTS[linkKind]}
      />
      <Box component="b" sx={TASK_COLUMN_STYLES.linkName}>
        {getTaskLinkName(task)}
      </Box>
      <Box component="span">{formatTaskLinkContext(task)}</Box>
    </Box>
  );
};

export default TaskLinkCaption;
