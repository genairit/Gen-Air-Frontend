import type { FC, ReactNode } from "react";
import { useStyles } from "./TaskForm.style";
import { Box, ButtonBase } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { focusSiblingOnArrow } from "../../../utilities/keyboard.utility";
import type { ITaskLinkOption } from "../../../interfaces/task.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { NEW_TASK_COPY, TASK_PROJECT_PICKER_COPY } from "../../../constants/task.constant";

interface ITaskLinkPickerProps {
  search: string;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  emptyAction?: ReactNode;
  options: ITaskLinkOption[];
  onSearch: (search: string) => void;
  onSelect: (optionId: string) => void;
}

const TaskLinkPicker: FC<ITaskLinkPickerProps> = ({
  error,
  search,
  isError,
  options,
  onRetry,
  onSearch,
  onSelect,
  isLoading,
  emptyAction,
}) => {
  const styles = useStyles();
  const copy = TASK_PROJECT_PICKER_COPY;

  const hasLoadedOptions = !isLoading && !isError;
  const hasNoResults = hasLoadedOptions && options.length === 0;

  return (
    <>
      <TextField
        value={search}
        onChange={onSearch}
        type={FIELD_TYPES.SEARCH}
        placeholder={copy.SEARCH}
        startIcon={ICON_NAMES.SEARCH}
      />
      <Box role="listbox" sx={styles.list} aria-label={copy.LABEL}>
        {isLoading && <LoadingState label={copy.LOADING} />}
        {isError && (
          <Box role="alert" sx={styles.selected}>
            <InlineError message={copy.ERROR} />
            <Button
              onClick={onRetry}
              text={NEW_TASK_COPY.RETRY}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        )}
        {hasLoadedOptions &&
          options.map(option => (
            <ButtonBase
              role="option"
              key={option.id}
              sx={styles.option}
              aria-selected={false}
              onKeyDown={focusSiblingOnArrow}
              onClick={() => onSelect(option.id)}
            >
              <Box sx={styles.optionText}>
                <Box component="b" sx={styles.optionName}>
                  {option.name}
                </Box>
                <Box component="span" sx={styles.caption}>
                  {option.caption}
                </Box>
              </Box>
              {option.tag && <Chip label={option.tag} />}
            </ButtonBase>
          ))}
        {hasNoResults && (
          <Box sx={styles.selected}>
            <Box component="span" sx={styles.hint}>
              {copy.EMPTY}
            </Box>
            {emptyAction}
          </Box>
        )}
      </Box>
      {error && (
        <Box component="span" sx={styles.error}>
          {error}
        </Box>
      )}
    </>
  );
};

export default TaskLinkPicker;
