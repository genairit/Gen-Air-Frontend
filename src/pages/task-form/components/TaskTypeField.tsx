import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";
import TaskTypeChip from "../../../components/TaskTypeChip/TaskTypeChip";
import { PROJECT_TASK_COPY, TASK_TYPES } from "../../../constants/task-type.constant";

const TaskTypeField = () => {
  const styles = useStyles();
  return (
    <Box sx={styles.typeField}>
      <FieldLabel title={PROJECT_TASK_COPY.TYPE} />
      <Box>
        <TaskTypeChip taskType={TASK_TYPES.GENERAL} />
      </Box>
      <Box component="span" sx={styles.hint}>
        {PROJECT_TASK_COPY.GENERAL_HELP}
      </Box>
    </Box>
  );
};
export default TaskTypeField;
