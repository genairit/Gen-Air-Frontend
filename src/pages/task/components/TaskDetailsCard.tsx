import {
  toDateInputValue,
  formatTaskDueFull,
  getTodayInputValue,
} from "../../../utilities/task.utility";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { type FC, useState } from "react";
import TaskFieldTile from "./TaskFieldTile";
import { useStyles } from "./TaskPanels.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TaskAssigneeField from "./TaskAssigneeField";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import { TASK_PAGE_COPY, NEW_TASK_COPY } from "../../../constants/task.constant";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import type { IApiTask, TUpdateTaskPayload } from "../../../interfaces/task.interface";
import { buildCustomerPath, buildProjectPath } from "../../../utilities/route.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface ITaskDetailsCardProps {
  task: IApiTask;
  isSaving: boolean;
  canClaim: boolean;
  isManager: boolean;
  onClaim: () => void;
  onUpdate: (payload: TUpdateTaskPayload) => void;
}

const TaskDetailsCard: FC<ITaskDetailsCardProps> = ({
  task,
  onClaim,
  canClaim,
  isSaving,
  onUpdate,
  isManager,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const [description, setDescription] = useState(task.description ?? "");

  const isLocked = !isManager;
  const trimmedDescription = description.trim();
  const isDescriptionChanged = trimmedDescription !== (task.description ?? "");
  const canSaveDescription = isDescriptionChanged && Boolean(trimmedDescription);
  const descriptionError = trimmedDescription ? null : NEW_TASK_COPY.REQUIRED;

  const changeDueDate = (dueDate: string) => {
    const isPast = dueDate < getTodayInputValue();

    if (!dueDate || isPast) {
      return;
    }

    onUpdate({ dueDate });
  };

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={TASK_PAGE_COPY.DETAILS_TITLE}
        subtitle={TASK_PAGE_COPY.DETAILS_SUBTITLE}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 220, gap: "14px" })}>
        <TaskFieldTile label={TASK_PAGE_COPY.PROJECT}>
          <Box component={Link} sx={styles.link} to={buildProjectPath(task.projectId)}>
            {task.project?.name ?? task.projectId}
          </Box>
        </TaskFieldTile>
        <TaskFieldTile label={TASK_PAGE_COPY.CUSTOMER}>
          <Box component={Link} sx={styles.link} to={buildCustomerPath(task.customerId)}>
            {task.customer?.name ?? task.customerId}
          </Box>
        </TaskFieldTile>
        <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.ASSIGNEE}>
          <TaskAssigneeField
            task={task}
            onClaim={onClaim}
            canClaim={canClaim}
            isManager={isManager}
            onAssign={assigneeId => onUpdate({ assigneeId })}
          />
        </TaskFieldTile>
        <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.DUE_DATE}>
          {isManager && (
            <TextField
              type={FIELD_TYPES.DATE}
              onChange={changeDueDate}
              value={toDateInputValue(task.dueDate)}
              slotProps={{ htmlInput: { min: getTodayInputValue() } }}
            />
          )}
          {isLocked && (
            <Box component="b" sx={styles.value}>
              {formatTaskDueFull(task)}
            </Box>
          )}
        </TaskFieldTile>
      </Box>
      <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.DESCRIPTION}>
        {isManager && (
          <>
            <TextField
              multiline
              minRows={4}
              value={description}
              type={FIELD_TYPES.TEXT}
              onChange={setDescription}
              validator={toErrorValidator(descriptionError)}
              placeholder={NEW_TASK_COPY.TASK_DESCRIPTION_PLACEHOLDER}
              maxLength={FIELD_INPUT_LIMITS.TASK_DESCRIPTION_CHARACTERS}
            />
            {isDescriptionChanged && (
              <Box>
                <Button
                  isLoading={isSaving}
                  icon={ICON_NAMES.SAVE}
                  disabled={!canSaveDescription}
                  text={TASK_PAGE_COPY.SAVE_DESCRIPTION}
                  onClick={() => onUpdate({ description: trimmedDescription })}
                />
              </Box>
            )}
          </>
        )}
        {isLocked && (
          <Box component="span" sx={styles.value}>
            {task.description}
          </Box>
        )}
      </TaskFieldTile>
    </Card>
  );
};

export default TaskDetailsCard;
