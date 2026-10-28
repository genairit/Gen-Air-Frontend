import {
  isTaskOverdue,
  getTaskCustomer,
  formatTaskDueLabel,
  formatAssigneeLabel,
  formatProjectTasksSubtitle,
} from "../../../utilities/task.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import { useTasksQuery } from "../../../hooks/queries/task.query";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { PROJECT_TASKS_COPY } from "../../../constants/task.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { TASK_COLUMN_STYLES } from "../../tasks/columns/task-columns.style";
import TaskStatusChip from "../../../components/TaskStatusChip/TaskStatusChip";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";
import { buildNewTaskPath, buildTaskPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IProjectTasksCardProps {
  projectId: string;
}

const ProjectTasksCard: FC<IProjectTasksCardProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const tasksQuery = useTasksQuery({ projectId });

  const tasks = (tasksQuery.data?.pages ?? []).flatMap(page => page.items);
  const isManager = hasPermission(sessionUser, PERMISSIONS.TASKS_CREATE);
  const isEmpty = tasksQuery.isSuccess && tasks.length === 0;

  const action = isManager ? (
    <Button
      variant={BUTTON_VARIANTS.NEUTRAL}
      text={PROJECT_TASKS_COPY.NEW_TASK}
      onClick={() => navigate(buildNewTaskPath(projectId))}
    />
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
