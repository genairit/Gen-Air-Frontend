import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import Chip from "../../../components/Chip/Chip";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import { NEW_TASK_COPY } from "../../../constants/task.constant";

interface ITaskProjectCustomerNoteProps {
  customerName: string;
}

const TaskProjectCustomerNote: FC<ITaskProjectCustomerNoteProps> = ({ customerName }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.context}>
      <Chip variant={CHIP_VARIANTS.INSET} label={NEW_TASK_COPY.INFO_ONLY} />
      <Box component="span">
        {NEW_TASK_COPY.PROJECT_CUSTOMER} <b>{customerName}</b> ·{" "}
        {NEW_TASK_COPY.PROJECT_CUSTOMER_NOTE}
      </Box>
    </Box>
  );
};

export default TaskProjectCustomerNote;
