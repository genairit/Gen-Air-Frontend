import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskHistory.style";
import { TASK_HISTORY_COPY } from "../../../constants/task.constant";
import type { IApiTaskTransition } from "../../../interfaces/task.interface";
import TaskStatusChip from "../../../components/TaskStatusChip/TaskStatusChip";

interface ITaskTransitionBadgeProps {
  transition: IApiTaskTransition;
}

const TaskTransitionBadge: FC<ITaskTransitionBadgeProps> = ({ transition }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.badge}>
      {transition.fromStatus === null && (
        <Box component="span" sx={styles.createdIn}>
          {TASK_HISTORY_COPY.CREATED_IN}
        </Box>
      )}
      {transition.fromStatus !== null && (
        <>
          <TaskStatusChip status={transition.fromStatus} />
          <Box aria-hidden component="span" sx={styles.arrow}>
            ←
          </Box>
        </>
      )}
      <TaskStatusChip status={transition.toStatus} />
    </Box>
  );
};

export default TaskTransitionBadge;
