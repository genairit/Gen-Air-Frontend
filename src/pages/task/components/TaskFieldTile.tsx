import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./TaskPanels.style";
import Icon from "../../../components/Icon/Icon";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { TASK_PAGE_COPY } from "../../../constants/task.constant";

interface ITaskFieldTileProps {
  label: string;
  isLocked?: boolean;
  children: ReactNode;
}

const TaskFieldTile: FC<ITaskFieldTileProps> = ({ label, children, isLocked = false }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.fieldTile}>
      <Box component="span" sx={styles.fieldLabel}>
        {label}
        {isLocked && (
          <Box component="span" sx={styles.lockNote}>
            <Icon size={14} name={ICON_NAMES.INFO} />
            {TASK_PAGE_COPY.MANAGERS_ONLY}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default TaskFieldTile;
