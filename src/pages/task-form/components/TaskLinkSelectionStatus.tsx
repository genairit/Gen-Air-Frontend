import {
  NEW_TASK_COPY,
  TASK_LINK_PICKER_COPY,
  type TaskLinkKindType,
} from "../../../constants/task.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskLinkSelectionStatusProps {
  isError: boolean;
  onRetry: () => void;
  onReplace: () => void;
  kind: TaskLinkKindType;
}

const TaskLinkSelectionStatus: FC<ITaskLinkSelectionStatusProps> = ({
  kind,
  isError,
  onRetry,
  onReplace,
}) => {
  const styles = useStyles();
  const copy = TASK_LINK_PICKER_COPY[kind];

  if (!isError) {
    return <LoadingState label={copy.SELECTED_LOADING} />;
  }

  return (
    <Box role="alert" sx={styles.selected}>
      <InlineError message={copy.SELECTED_ERROR} />
      <Box sx={styles.actionRow}>
        <Button onClick={onRetry} text={NEW_TASK_COPY.RETRY} variant={BUTTON_VARIANTS.NEUTRAL} />
        <Button onClick={onReplace} text={copy.REPLACE} variant={BUTTON_VARIANTS.NEUTRAL} />
      </Box>
    </Box>
  );
};

export default TaskLinkSelectionStatus;
