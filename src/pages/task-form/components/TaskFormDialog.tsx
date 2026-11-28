import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import TaskContentCard from "./TaskContentCard";
import { usePageStyles } from "../../page.style";
import { type FC, useRef, type ReactNode } from "react";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import type { ITaskFormValues, TTaskFormErrors } from "../../../interfaces/task.interface";

interface ITaskFormDialogProps {
  title: string;
  context: string;
  saveLabel: string;
  isPending: boolean;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  saveDisabled: boolean;
  canEditContent: boolean;
  values: ITaskFormValues;
  errors: TTaskFormErrors;
  onChange: (changes: Partial<ITaskFormValues>) => void;
}

const TaskFormDialog: FC<ITaskFormDialogProps> = ({
  title,
  context,
  saveLabel,
  isPending,
  canEditContent,
  saveDisabled,
  children,
  values,
  errors,
  onClose,
  onChange,
  onSubmit,
}) => {
  const styles = usePageStyles();
  const formStyles = useStyles();
  const fieldRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const errorCount = Object.keys(errors).length;

  return (
    <GenericPopup
      open
      align="right"
      maxWidth="sm"
      title={title}
      onClose={onClose}
      titleRef={headingRef}
      closeAfterAction={false}
      dir={TEXT_DIRECTIONS.RTL}
      closeDisabled={isPending}
      initialFocusRef={canEditContent ? fieldRef : headingRef}
      buttons={{
        primary: {
          text: isPending ? NEW_TASK_COPY.SAVING : saveLabel,
          onClick: onSubmit,
          isDisabled: saveDisabled || isPending,
        },
        secondary: { text: NEW_TASK_COPY.CANCEL, onClick: onClose, isDisabled: isPending },
      }}
      content={
        <Box sx={styles.stack({ gap: "16px" })}>
          {context && (
            <Box component="span" sx={formStyles.projectContext}>
              {context}
            </Box>
          )}
          <TaskContentCard
            values={values}
            errors={errors}
            titleRef={fieldRef}
            onChange={onChange}
            disabled={!canEditContent}
          />
          {children}
          {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
        </Box>
      }
    />
  );
};

export default TaskFormDialog;
