import {
  isTaskOverdue,
  getTaskCustomer,
  formatTaskDueLabel,
  formatAssigneeLabel,
} from "../../../utilities/task.utility";

import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { type FC, useState, type MouseEvent } from "react";
import { theme } from "../../../constants/theme.constants";
import { useSessionUser } from "../../../store/session.store";
import ChoiceMenu from "../../../components/ChoiceMenu/ChoiceMenu";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
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
  const styles = usePageStyles();
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const isManager = hasPermission(sessionUser, PERMISSIONS.TASKS_CREATE);
  const tasksQuery = useTasksQuery({ projectId });
  const slotsQuery = useProjectProtectedTasksQuery(isManager ? projectId : null);

  const tasks = (tasksQuery.data?.pages ?? []).flatMap(page => page.items);
  const isEmpty = tasksQuery.isSuccess && tasks.length === 0;

  const chooseType = (taskType: TaskType) => {
    setMenuAnchor(null);
    const slot = slotsQuery.data?.find(item => item.taskType === taskType);
    navigate(slot?.available ? buildTaskPath(slot.id) : buildNewTaskPath(projectId, taskType));
  };
  const taskTypeOptions = Object.values(TASK_TYPES).map(taskType => {
    const isProtected = taskType !== TASK_TYPES.GENERAL;
    const slot = slotsQuery.data?.find(item => item.taskType === taskType);
    const disabled =
      isProtected && (slotsQuery.isPending || slotsQuery.isError || slot?.available === false);
    const actionCopy = slot?.available
      ? PROJECT_TASKS_COPY.OPEN_EXISTING
      : PROJECT_TASKS_COPY.CREATE_TASK;
    return {
      id: taskType,
      onSelect: () => chooseType(taskType),
      label: TASK_TYPE_LABELS[taskType],
      disabled,
      description: slot?.available === false ? PROJECT_TASKS_COPY.EXISTING_UNAVAILABLE : actionCopy,
    };
  });

  const action = isManager ? (
    <>
      <Button
        size="compact"
        variant={BUTTON_VARIANTS.NEUTRAL}
        text={PROJECT_TASKS_COPY.NEW_TASK}
        onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
      />
      <ChoiceMenu
        anchorEl={menuAnchor}
        options={taskTypeOptions}
        onClose={() => setMenuAnchor(null)}
        title={PROJECT_TASKS_COPY.CHOOSE_TYPE}
      />
    </>
  ) : null;
  return (
    <Card gap="4px" ariaLabel={PROJECT_TASKS_COPY.TITLE}>
      {action && <Box sx={styles.endRow}>{action}</Box>}
      {tasksQuery.isPending && <LoadingState label={PROJECT_TASKS_COPY.TITLE} />}
      {tasksQuery.isError && <InlineError message={getApiErrorMessage(tasksQuery.error)} />}
      {tasks.map(task => (
        <Card
          gap="8px"
          key={task.id}
          padding="9px 12px"
          ariaLabel={task.title}
          depth={SURFACE_DEPTHS.INSET}
          onClick={() => navigate(buildTaskPath(task.id))}
          sx={{
            boxShadow: "none",
            borderRadius: 0,
            border: 0,
            borderBottom: `1px solid ${theme.glass.border}`,
          }}
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
