import {
  isTaskOverdue,
  getTaskCustomer,
  formatTaskDueLabel,
  formatAssigneeLabel,
  formatProjectTasksSubtitle,
} from "../../../utilities/task.utility";

import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { Box, Menu, MenuItem } from "@mui/material";
import Button from "../../../components/Button/Button";
import { type FC, useState, type MouseEvent } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { PROJECT_TASKS_COPY } from "../../../constants/task.constant";
import TaskTypeChip from "../../../components/TaskTypeChip/TaskTypeChip";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { TASK_COLUMN_STYLES } from "../../tasks/columns/task-columns.style";
import TaskStatusChip from "../../../components/TaskStatusChip/TaskStatusChip";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";
import { buildNewTaskPath, buildTaskPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useTasksQuery, useProjectProtectedTasksQuery } from "../../../hooks/queries/task.query";
import { TASK_TYPES, TASK_TYPE_LABELS, type TaskType } from "../../../constants/task-type.constant";

interface IProjectTasksCardProps {
  projectId: string;
}

const ProjectTasksCard: FC<IProjectTasksCardProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const isManager = hasPermission(sessionUser, PERMISSIONS.TASKS_CREATE);
  const tasksQuery = useTasksQuery({ projectId });
  const slotsQuery = useProjectProtectedTasksQuery(isManager ? projectId : null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const tasks = (tasksQuery.data?.pages ?? []).flatMap(page => page.items);
  const isEmpty = tasksQuery.isSuccess && tasks.length === 0;

  const chooseType = (taskType: TaskType) => {
    setMenuAnchor(null);
    const slot = slotsQuery.data?.find(item => item.taskType === taskType);
    navigate(slot?.available ? buildTaskPath(slot.id) : buildNewTaskPath(projectId, taskType));
  };

  const action = isManager ? (
    <>
      <Button
        variant={BUTTON_VARIANTS.NEUTRAL}
        text={PROJECT_TASKS_COPY.NEW_TASK}
        onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
      />
      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        {Object.values(TASK_TYPES).map(taskType => {
          const isProtected = taskType !== TASK_TYPES.GENERAL;
          const slot = slotsQuery.data?.find(item => item.taskType === taskType);
          const isUnavailable =
            isProtected &&
            (slotsQuery.isPending || slotsQuery.isError || slot?.available === false);
          const absentCopy =
            slot?.available === false
              ? PROJECT_TASKS_COPY.EXISTING_UNAVAILABLE
              : PROJECT_TASKS_COPY.NEW_TASK;
          const actionCopy = slot?.available ? PROJECT_TASKS_COPY.OPEN_EXISTING : absentCopy;
          return (
            <MenuItem key={taskType} disabled={isUnavailable} onClick={() => chooseType(taskType)}>
              {actionCopy}
              {" · "}
              {TASK_TYPE_LABELS[taskType]}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  ) : (
    <Box component="span" sx={styles.caption}>
      {PROJECT_TASKS_COPY.MANAGERS_ONLY}
    </Box>
  );

  return (
    <Card gap="16px">
      <CardHeader
        action={action}
        icon={ICON_NAMES.TASKS}
        title={PROJECT_TASKS_COPY.TITLE}
        subtitle={formatProjectTasksSubtitle(tasks.length)}
      />
      {tasksQuery.isPending && <LoadingState label={PROJECT_TASKS_COPY.TITLE} />}
      {tasksQuery.isError && <InlineError message={getApiErrorMessage(tasksQuery.error)} />}
      {tasks.map(task => (
        <Card
          gap="8px"
          key={task.id}
          padding="14px 18px"
          ariaLabel={task.title}
          onClick={() => navigate(buildTaskPath(task.id))}
        >
          <Box sx={TASK_COLUMN_STYLES.mobileRow}>
            <Box sx={TASK_COLUMN_STYLES.cell}>
              <Box component="b" sx={TASK_COLUMN_STYLES.title}>
                {task.title}
              </Box>
              <Box component="span" sx={TASK_COLUMN_STYLES.caption}>
                {getTaskCustomer(task)?.name}
              </Box>
            </Box>
            <Box sx={styles.row({ gap: "8px" })}>
              <TaskTypeChip taskType={task.taskType} />
              <TaskStatusChip status={task.status} />
              {task.isUrgent && <TaskUrgentChip />}
            </Box>
            <Box component="span" sx={TASK_COLUMN_STYLES.assigneeName(!task.assignee)}>
              {formatAssigneeLabel(task)}
            </Box>
            <Box component="span" sx={TASK_COLUMN_STYLES.due(isTaskOverdue(task))}>
              {formatTaskDueLabel(task)}
            </Box>
          </Box>
        </Card>
      ))}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {PROJECT_TASKS_COPY.EMPTY}
        </Box>
      )}
    </Card>
  );
};

export default ProjectTasksCard;
