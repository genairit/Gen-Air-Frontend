import { useStyles } from "./TaskForm.style";
import type { FC, KeyboardEvent } from "react";
import { Box, ButtonBase } from "@mui/material";
import IconTile from "../../../components/IconTile/IconTile";
import type { IconNameType } from "../../../constants/icon.constant";
import RadioIndicator from "../../../components/RadioButton/RadioIndicator";

interface ITaskLinkKindOptionProps {
  title: string;
  subtitle: string;
  tabIndex: number;
  icon: IconNameType;
  isSelected: boolean;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const TaskLinkKindOption: FC<ITaskLinkKindOptionProps> = ({
  icon,
  title,
  subtitle,
  tabIndex,
  onSelect,
  onKeyDown,
  isSelected,
}) => {
  const styles = useStyles();

  return (
    <ButtonBase
      role="radio"
      onClick={onSelect}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-checked={isSelected}
      sx={styles.linkKindOption(isSelected)}
    >
      <IconTile name={icon} />
      <Box sx={styles.linkKindText}>
        <Box component="b" sx={styles.optionName}>
          {title}
        </Box>
        <Box component="span" sx={styles.caption}>
          {subtitle}
        </Box>
      </Box>
      <RadioIndicator checked={isSelected} />
    </ButtonBase>
  );
};

export default TaskLinkKindOption;
