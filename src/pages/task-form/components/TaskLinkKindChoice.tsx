import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import type { FC, KeyboardEvent } from "react";
import TaskLinkKindOption from "./TaskLinkKindOption";
import { focusGroupItem, getRtlArrowTarget } from "../../../utilities/keyboard.utility";
import { TASK_LINK_CHOICES, type TaskLinkKindType } from "../../../constants/task.constant";

interface ITaskLinkKindChoiceProps {
  labelId: string;
  linkKind: TaskLinkKindType | null;
  onChange: (linkKind: TaskLinkKindType) => void;
}

const TaskLinkKindChoice: FC<ITaskLinkKindChoiceProps> = ({ labelId, linkKind, onChange }) => {
  const styles = useStyles();

  const getTabIndex = (kind: TaskLinkKindType, index: number) => {
    const isSelected = kind === linkKind;
    const isDefaultTabStop = !linkKind && index === 0;

    return isSelected || isDefaultTabStop ? 0 : -1;
  };

  const selectByArrow = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const targetIndex = getRtlArrowTarget({
      index,
      key: event.key,
      count: TASK_LINK_CHOICES.length,
    });

    if (targetIndex === null) {
      return;
    }

    event.preventDefault();
    onChange(TASK_LINK_CHOICES[targetIndex].kind);
    focusGroupItem(event.currentTarget, targetIndex);
  };

  return (
    <Box role="radiogroup" aria-labelledby={labelId} sx={styles.linkKindOptions}>
      {TASK_LINK_CHOICES.map((choice, index) => (
        <TaskLinkKindOption
          key={choice.kind}
          icon={choice.icon}
          title={choice.title}
          subtitle={choice.subtitle}
          isSelected={choice.kind === linkKind}
          onSelect={() => onChange(choice.kind)}
          tabIndex={getTabIndex(choice.kind, index)}
          onKeyDown={event => selectByArrow(event, index)}
        />
      ))}
    </Box>
  );
};

export default TaskLinkKindChoice;
