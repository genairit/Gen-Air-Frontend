import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import type { FC, KeyboardEvent } from "react";
import { usePageStyles } from "../../page.style";
import IconTile from "../../../components/IconTile/IconTile";
import { useSessionUser } from "../../../store/session.store";
import ChoiceRow from "../../../components/ChoiceRow/ChoiceRow";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { formatUrgentSaveLead } from "../../../utilities/task.utility";
import { NEW_TASK_COPY, URGENCY_CHOICES } from "../../../constants/task.constant";
import { focusGroupItem, getRtlArrowTarget } from "../../../utilities/keyboard.utility";
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
  const pageStyles = usePageStyles();
  const user = useSessionUser();

  if (!hasPermission(user, PERMISSIONS.TASKS_URGENCY_CHANGE)) {
    return null;
  }

  const changeWithArrows = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const nextIndex = getRtlArrowTarget({ key: event.key, index, count: URGENCY_CHOICES.length });
    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    onChange(URGENCY_CHOICES[nextIndex].isUrgent);
    focusGroupItem(event.currentTarget, nextIndex);
  };

  return (
    <Box sx={pageStyles.stack({ gap: "8px" })}>
      <FieldLabel title={NEW_TASK_COPY.URGENCY_TITLE} />
      <Box role="radiogroup" sx={styles.urgencyOptions} aria-label={NEW_TASK_COPY.URGENCY_TITLE}>
        {URGENCY_CHOICES.map((choice, index) => (
          <ChoiceRow
            role="radio"
            key={choice.title}
            onClick={() => onChange(choice.isUrgent)}
            aria-checked={choice.isUrgent === isUrgent}
            tabIndex={choice.isUrgent === isUrgent ? 0 : -1}
            onKeyDown={event => changeWithArrows(event, index)}
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
          </ChoiceRow>
        ))}
      </Box>
      {isUrgent && (
        <Box sx={pageStyles.stack({ gap: "4px" })}>
          <Box component="span" sx={styles.previewLead}>
            {formatUrgentSaveLead(recipient)}
          </Box>
          <UrgencyPushPreview taskTitle={taskTitle} recipient={recipient} detailLine={detailLine} />
        </Box>
      )}
    </Box>
  );
};

export default TaskUrgencyChoiceCard;
