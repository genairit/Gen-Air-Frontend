import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { getTodayInputValue } from "../../../utilities/task.utility";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { TTaskFormErrors, ITaskFormValues } from "../../../interfaces/task.interface";

interface ITaskContentCardProps {
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  onChange: (changes: Partial<ITaskFormValues>) => void;
}

const TaskContentCard: FC<ITaskContentCardProps> = ({ errors, values, onChange }) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={NEW_TASK_COPY.DETAILS_TITLE}
        subtitle={NEW_TASK_COPY.DETAILS_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 260, gap: "20px" })}>
        <TextField
          isRequired
          value={values.title}
          type={FIELD_TYPES.TEXT}
          title={NEW_TASK_COPY.TASK_TITLE}
          onChange={title => onChange({ title })}
          validator={toErrorValidator(errors.title)}
          placeholder={NEW_TASK_COPY.TASK_TITLE_PLACEHOLDER}
          maxLength={FIELD_INPUT_LIMITS.TASK_TITLE_CHARACTERS}
        />
        <TextField
          value={values.dueDate}
          type={FIELD_TYPES.DATE}
          title={NEW_TASK_COPY.DUE_DATE}
          onChange={dueDate => onChange({ dueDate })}
          validator={toErrorValidator(errors.dueDate)}
          slotProps={{ htmlInput: { min: getTodayInputValue() } }}
        />
      </Box>
      <TextField
        multiline
        isRequired
        minRows={4}
        type={FIELD_TYPES.TEXT}
        value={values.description}
        title={NEW_TASK_COPY.TASK_DESCRIPTION}
        validator={toErrorValidator(errors.description)}
        onChange={description => onChange({ description })}
        placeholder={NEW_TASK_COPY.TASK_DESCRIPTION_PLACEHOLDER}
        maxLength={FIELD_INPUT_LIMITS.TASK_DESCRIPTION_CHARACTERS}
      />
    </Card>
  );
};

export default TaskContentCard;
