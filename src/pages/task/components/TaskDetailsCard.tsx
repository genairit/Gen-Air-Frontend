import {
  getTaskLinkKind,
  getTaskLinkName,
  toDateInputValue,
  buildTaskLinkPath,
  formatTaskDueFull,
  getTodayInputValue,
  getTaskProjectCustomer,
  formatTaskLinkedToLabel,
} from "../../../utilities/task.utility";

import {
  NEW_TASK_COPY,
  TASK_PAGE_COPY,
  TASK_LINK_KIND_LABELS,
  TASK_LINK_CHIP_VARIANTS,
} from "../../../constants/task.constant";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { type FC, useState } from "react";
import TaskFieldTile from "./TaskFieldTile";
import { useStyles } from "./TaskPanels.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import TaskAssigneeField from "./TaskAssigneeField";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { buildCustomerPath } from "../../../utilities/route.utility";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import type { IApiTask, TUpdateTaskPayload } from "../../../interfaces/task.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface ITaskDetailsCardProps {
  task: IApiTask;
  canEdit: boolean;
  isSaving: boolean;
  canClaim: boolean;
  canAssign: boolean;
  onClaim: () => void;
  onUpdate: (payload: TUpdateTaskPayload) => void;
}

const TaskDetailsCard: FC<ITaskDetailsCardProps> = ({
  task,
  onClaim,
  canClaim,
  isSaving,
  onUpdate,
  canEdit,
  canAssign,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const [description, setDescription] = useState(task.description ?? "");

  const isLocked = !canEdit;
  const isAssignmentLocked = !canAssign;
  const linkKind = getTaskLinkKind(task);
  const linkPath = buildTaskLinkPath(task);
  const projectCustomer = getTaskProjectCustomer(task);
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
        <TaskFieldTile label={formatTaskLinkedToLabel(task)}>
          <Box sx={styles.linkRow}>
            <Chip
              size={CHIP_SIZES.SMALL}
              label={TASK_LINK_KIND_LABELS[linkKind]}
              variant={TASK_LINK_CHIP_VARIANTS[linkKind]}
            />
            {linkPath && (
              <Box to={linkPath} component={Link} sx={styles.link}>
                {getTaskLinkName(task)}
              </Box>
            )}
          </Box>
        </TaskFieldTile>
        {projectCustomer && (
          <TaskFieldTile label={TASK_PAGE_COPY.PROJECT_CUSTOMER}>
            <Box component={Link} sx={styles.link} to={buildCustomerPath(projectCustomer.id)}>
              {projectCustomer.name}
            </Box>
          </TaskFieldTile>
        )}
        <TaskFieldTile isLocked={isAssignmentLocked} label={TASK_PAGE_COPY.ASSIGNEE}>
          <TaskAssigneeField
            task={task}
            onClaim={onClaim}
            canClaim={canClaim}
            isManager={canAssign}
            onAssign={assigneeId => onUpdate({ assigneeId })}
          />
        </TaskFieldTile>
        <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.DUE_DATE}>
          {canEdit && (
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
        {canEdit && (
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
