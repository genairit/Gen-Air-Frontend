import {
  TASK_PAGE_COPY,
  TASK_STATUS_TABS,
  type TaskStatusType,
} from "../../../constants/task.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskPanels.style";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import IconTile from "../../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IApiTask } from "../../../interfaces/task.interface";
import { isTaskStatus } from "../../../utilities/guards/task.guard";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import { ICON_TILE_SIZES } from "../../../constants/icon-tile.constant";
import { formatTaskCreatedCaption } from "../../../utilities/task.utility";
import TaskStatusChip from "../../../components/TaskStatusChip/TaskStatusChip";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";

interface ITaskHeaderCardProps {
  task: IApiTask;
  onStatusChange: (status: TaskStatusType) => void;
}

const TaskHeaderCard: FC<ITaskHeaderCardProps> = ({ task, onStatusChange }) => {
  const styles = useStyles();

  const changeStatus = (tabId: string) => {
    if (!isTaskStatus(tabId) || tabId === task.status) {
      return;
    }

    onStatusChange(tabId);
  };

  return (
    <Card gap="18px">
      <Box sx={styles.identity}>
        <IconTile
          name={ICON_NAMES.TASKS}
          size={ICON_TILE_SIZES.LARGE}
          depth={SURFACE_DEPTHS.INSET}
        />
        <Box sx={styles.details}>
          <Box component="h1" sx={styles.title}>
            {task.title}
          </Box>
          <Box sx={styles.metaRow}>
            <TaskStatusChip status={task.status} />
            {task.isUrgent && <TaskUrgentChip />}
            <Box component="span" sx={styles.caption}>
              {formatTaskCreatedCaption(task)}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box component="span" sx={styles.statusLabel}>
        <Box component="b" sx={styles.statusTitle}>
          {TASK_PAGE_COPY.STATUS_TITLE}
        </Box>
        {`· ${TASK_PAGE_COPY.STATUS_HINT}`}
      </Box>
      <Tabs isFullWidth activeId={task.status} onChange={changeStatus} items={TASK_STATUS_TABS} />
    </Card>
  );
};

export default TaskHeaderCard;
