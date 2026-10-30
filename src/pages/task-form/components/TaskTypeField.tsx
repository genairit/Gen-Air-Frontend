import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import TaskTypeChip from "../../../components/TaskTypeChip/TaskTypeChip";
import { PROJECT_TASK_COPY, TASK_TYPES } from "../../../constants/task-type.constant";

const TaskTypeField = () => {
  const styles = useStyles();
  return (
    <Box sx={styles.context} aria-label={PROJECT_TASK_COPY.TYPE}>
      <TaskTypeChip taskType={TASK_TYPES.GENERAL} />
      <Box component="span">{PROJECT_TASK_COPY.GENERAL_HELP}</Box>
    </Box>
  );
};
export default TaskTypeField;
