import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { NEW_TASK_COPY, TASK_PROJECT_PICKER_COPY } from "../../../constants/task.constant";

interface ITaskLinkSelectionStatusProps {
  isError: boolean;
  onRetry: () => void;
  onReplace: () => void;
}

const TaskLinkSelectionStatus: FC<ITaskLinkSelectionStatusProps> = ({
  isError,
  onRetry,
  onReplace,
}) => {
  const styles = useStyles();
  const copy = TASK_PROJECT_PICKER_COPY;

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
