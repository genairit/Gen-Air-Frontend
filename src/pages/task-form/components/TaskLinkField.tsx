import type {
  ITaskFormValues,
  TTaskFormErrors,
  ITaskLinkOption,
} from "../../../interfaces/task.interface";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import TaskProjectPicker from "./TaskProjectPicker";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";
import { TASK_PROJECT_PICKER_COPY } from "../../../constants/task.constant";

interface ITaskLinkFieldProps {
  values: ITaskFormValues;
  errors: TTaskFormErrors;
  onChange: (option: ITaskLinkOption | null) => void;
}
const TaskLinkField: FC<ITaskLinkFieldProps> = ({ values, errors, onChange }) => {
  const styles = usePageStyles();
  return (
    <Box sx={styles.stack({ gap: "10px" })}>
      <FieldLabel isRequired title={TASK_PROJECT_PICKER_COPY.LABEL} />
      <TaskProjectPicker
        onChange={onChange}
        projectId={values.projectId}
        error={errors.projectId ?? null}
      />
    </Box>
  );
};
export default TaskLinkField;
