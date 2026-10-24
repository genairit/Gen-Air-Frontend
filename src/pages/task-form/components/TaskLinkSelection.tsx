import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./TaskForm.style";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import type { ITaskLinkOption } from "../../../interfaces/task.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskLinkSelectionProps {
  context?: ReactNode;
  replaceLabel: string;
  onReplace: () => void;
  option: ITaskLinkOption;
}

const TaskLinkSelection: FC<ITaskLinkSelectionProps> = ({
  option,
  context,
  onReplace,
  replaceLabel,
}) => {
  const styles = useStyles();

  return (
    <>
      <Box sx={styles.selected}>
        <Box sx={styles.optionText}>
          <Box component="b" sx={styles.optionName}>
            {option.name}
          </Box>
          <Box component="span" sx={styles.caption}>
            {option.caption}
          </Box>
        </Box>
        <Box sx={styles.actionRow}>
          {option.tag && <Chip label={option.tag} />}
          <Button onClick={onReplace} text={replaceLabel} variant={BUTTON_VARIANTS.NEUTRAL} />
        </Box>
      </Box>
      {context}
    </>
  );
};

export default TaskLinkSelection;
