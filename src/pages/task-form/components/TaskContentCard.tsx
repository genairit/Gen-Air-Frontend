import { Box } from "@mui/material";
import type { FC, RefObject } from "react";
import { usePageStyles } from "../../page.style";
import TextField from "../../../components/TextField/TextField";
import DateField from "../../../components/DateField/DateField";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { TTaskFormErrors, ITaskFormValues } from "../../../interfaces/task.interface";

interface ITaskContentCardProps {
  disabled?: boolean;
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  titleRef?: RefObject<HTMLInputElement | null>;
  onChange: (changes: Partial<ITaskFormValues>) => void;
}

const TaskContentCard: FC<ITaskContentCardProps> = ({
  errors,
  values,
  onChange,
  titleRef,
  disabled = false,
}) => {
  const styles = usePageStyles();
  const earliestDueDate = new Date();

  return (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={styles.grid({ minColumnWidth: 200, gap: "16px" })}>
        <TextField
          isRequired
          inputRef={titleRef}
          disabled={disabled}
          value={values.title}
          type={FIELD_TYPES.TEXT}
          title={NEW_TASK_COPY.TASK_TITLE}
          onChange={title => onChange({ title })}
          validator={toErrorValidator(errors.title)}
          placeholder={NEW_TASK_COPY.TASK_TITLE_PLACEHOLDER}
          maxLength={FIELD_INPUT_LIMITS.TASK_TITLE_CHARACTERS}
        />
        <DateField
          disabled={disabled}
          value={values.dueDate}
          minDate={earliestDueDate}
          errorText={errors.dueDate}
          title={NEW_TASK_COPY.DUE_DATE}
          ariaLabel={NEW_TASK_COPY.DUE_DATE}
          onChange={dueDate => onChange({ dueDate })}
        />
      </Box>
      <TextField
        multiline
        isRequired
        minRows={2}
        disabled={disabled}
        type={FIELD_TYPES.TEXT}
        value={values.description}
        title={NEW_TASK_COPY.TASK_DESCRIPTION}
        validator={toErrorValidator(errors.description)}
        onChange={description => onChange({ description })}
        placeholder={NEW_TASK_COPY.TASK_DESCRIPTION_PLACEHOLDER}
        maxLength={FIELD_INPUT_LIMITS.TASK_DESCRIPTION_CHARACTERS}
      />
    </Box>
  );
};

export default TaskContentCard;
