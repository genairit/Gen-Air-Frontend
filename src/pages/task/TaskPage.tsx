import TaskView from "./components/TaskView";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { useTaskQuery } from "../../hooks/queries/task.query";
import { TASK_PAGE_COPY } from "../../constants/task.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import { hasPermission } from "../../utilities/permission.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";

const TaskPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const sessionUser = useSessionUser();
  const taskId = params[ROUTE_PARAMS.TASK_ID] ?? null;
  const taskQuery = useTaskQuery(taskId);

  const isManager = hasPermission(sessionUser, "MANAGE_TASKS");
  const canClaim = hasPermission(sessionUser, "CLAIM_TASKS");
  const canChangeStatus = hasPermission(sessionUser, "UPDATE_TASK_STATUS");

  if (taskQuery.isPending) {
    return <LoadingState label={TASK_PAGE_COPY.LOADING} />;
  }

  if (taskQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.TASKS}
        title={TASK_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(taskQuery.error)}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={TASK_PAGE_COPY.BACK_TO_TASKS}
            onClick={() => navigate(ROUTE_PATHS.TASKS)}
          />
        }
      />
    );
  }

  return (
    <TaskView
      canClaim={canClaim}
      task={taskQuery.data}
      isManager={isManager}
      key={taskQuery.data.id}
      canChangeStatus={canChangeStatus}
    />
  );
};

export default TaskPage;
