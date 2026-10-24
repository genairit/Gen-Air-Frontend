import {
  NEW_TASK_COPY,
  TASK_LINK_PICKER_COPY,
  type TaskLinkKindType,
} from "../../../constants/task.constant";

import type {
  ITaskFormValues,
  TTaskFormErrors,
  ITaskLinkOption,
} from "../../../interfaces/task.interface";

import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./TaskForm.style";
import { usePageStyles } from "../../page.style";
import TaskProjectPicker from "./TaskProjectPicker";
import TaskCustomerPicker from "./TaskCustomerPicker";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";

interface ITaskLinkFieldProps {
  values: ITaskFormValues;
  errors: TTaskFormErrors;
  onChange: (option: ITaskLinkOption | null) => void;
}

const TaskLinkField: FC<ITaskLinkFieldProps> = ({ values, errors, onChange }) => {
  const { linkKind } = values;
  const styles = useStyles();
  const pageStyles = usePageStyles();

  if (!linkKind) {
    return <Box sx={styles.placeholder}>{NEW_TASK_COPY.NO_LINK_KIND}</Box>;
  }

  const pickers: Record<TaskLinkKindType, ReactNode> = {
    customer: (
      <TaskCustomerPicker
        onChange={onChange}
        customerId={values.customerId}
        error={errors.customerId ?? null}
      />
    ),
    project: (
      <TaskProjectPicker
        onChange={onChange}
        projectId={values.projectId}
        error={errors.projectId ?? null}
      />
    ),
  };

  return (
    <Box sx={pageStyles.stack({ gap: "10px" })}>
      <FieldLabel isRequired title={TASK_LINK_PICKER_COPY[linkKind].LABEL} />
      {pickers[linkKind]}
    </Box>
  );
};

export default TaskLinkField;
