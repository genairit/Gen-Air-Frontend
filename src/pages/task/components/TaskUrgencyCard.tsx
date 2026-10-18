import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskPanels.style";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import IconTile from "../../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { TASK_PAGE_COPY } from "../../../constants/task.constant";
import type { IApiTask } from "../../../interfaces/task.interface";
import { formatUrgencyText } from "../../../utilities/task.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskUrgencyCardProps {
  task: IApiTask;
  isManager: boolean;
  onRequestChange: () => void;
}

const TaskUrgencyCard: FC<ITaskUrgencyCardProps> = ({ task, isManager, onRequestChange }) => {
  const styles = useStyles();
  const urgencyTitle = task.isUrgent ? TASK_PAGE_COPY.URGENT_TITLE : TASK_PAGE_COPY.REGULAR_TITLE;
  const actionText = task.isUrgent ? TASK_PAGE_COPY.CLEAR_URGENT : TASK_PAGE_COPY.MARK_URGENT;
  const actionVariant = task.isUrgent ? BUTTON_VARIANTS.NEUTRAL : BUTTON_VARIANTS.DARK;

  return (
    <Card gap="14px" sx={styles.urgencyCard(task.isUrgent)}>
      <Box sx={styles.identity}>
        <IconTile name={task.isUrgent ? ICON_NAMES.URGENT : ICON_NAMES.PENDING} />
        <Box sx={styles.urgencyText}>
          <Box component="b" sx={styles.urgencyTitle}>
            {urgencyTitle}
          </Box>
          <Box component="span" sx={styles.urgencySubtitle(task.isUrgent)}>
            {formatUrgencyText(task)}
          </Box>
        </Box>
      </Box>
      {isManager && <Button text={actionText} variant={actionVariant} onClick={onRequestChange} />}
      {!isManager && (
        <Box component="span" sx={styles.lockNote}>
          <Icon size={16} name={ICON_NAMES.INFO} />
          {TASK_PAGE_COPY.URGENCY_MANAGERS_ONLY}
        </Box>
      )}
    </Card>
  );
};

export default TaskUrgencyCard;
