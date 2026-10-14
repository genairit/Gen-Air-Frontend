import type { FC } from "react";
import { useStyles } from "./TaskForm.style";
import { Box, ButtonBase } from "@mui/material";
import Card from "../../../components/Card/Card";
import IconTile from "../../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { formatUrgentSaveLead } from "../../../utilities/task.utility";
import { NEW_TASK_COPY, URGENCY_CHOICES } from "../../../constants/task.constant";
import UrgencyPushPreview from "../../../components/UrgencyConfirmPopup/UrgencyPushPreview";

interface ITaskUrgencyChoiceCardProps {
  isUrgent: boolean;
  taskTitle: string;
  recipient: string;
  detailLine: string;
  onChange: (isUrgent: boolean) => void;
}

const TaskUrgencyChoiceCard: FC<ITaskUrgencyChoiceCardProps> = ({
  isUrgent,
  onChange,
  taskTitle,
  recipient,
  detailLine,
}) => {
  const styles = useStyles();

  return (
    <Card gap="20px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.URGENT}
        title={NEW_TASK_COPY.URGENCY_TITLE}
        subtitle={NEW_TASK_COPY.URGENCY_SUBTITLE}
      />
      <Box role="radiogroup" sx={styles.urgencyOptions}>
        {URGENCY_CHOICES.map(choice => (
          <ButtonBase
            role="radio"
            key={choice.title}
            onClick={() => onChange(choice.isUrgent)}
            aria-checked={choice.isUrgent === isUrgent}
            sx={styles.urgencyOption({
              isUrgent: choice.isUrgent,
              isSelected: choice.isUrgent === isUrgent,
            })}
          >
            <IconTile name={choice.icon} />
            <Box sx={styles.urgencyText}>
              <Box component="b">{choice.title}</Box>
              <Box component="span">{choice.subtitle}</Box>
            </Box>
          </ButtonBase>
        ))}
      </Box>
      {isUrgent && (
        <Box sx={styles.optionText}>
          <Box component="span" sx={styles.previewLead}>
            {formatUrgentSaveLead(recipient)}
          </Box>
          <UrgencyPushPreview taskTitle={taskTitle} recipient={recipient} detailLine={detailLine} />
        </Box>
      )}
    </Card>
  );
};

export default TaskUrgencyChoiceCard;
