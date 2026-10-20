import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import { useNavigate } from "react-router-dom";
import TasksTable from "./components/TasksTable";
import Button from "../../components/Button/Button";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import { TASKS_PAGE_COPY } from "../../constants/task.constant";
import { hasPermission } from "../../utilities/permission.utility";

const TasksPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const isManager = hasPermission(sessionUser, "MANAGE_TASKS");
  const canClaim = hasPermission(sessionUser, "CLAIM_TASKS");
  const canChangeStatus = hasPermission(sessionUser, "UPDATE_TASK_STATUS");

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Box sx={styles.headerText}>
          <Box component="span" sx={styles.eyebrow}>
            <Icon size={22} name={ICON_NAMES.TASKS} />
            {TASKS_PAGE_COPY.EYEBROW}
          </Box>
          <Box component="h1" sx={styles.heading}>
            {TASKS_PAGE_COPY.TITLE}
          </Box>
          <Box component="span" sx={styles.description}>
            {TASKS_PAGE_COPY.DESCRIPTION}
          </Box>
        </Box>
        {isManager && (
          <Button
            icon={ICON_NAMES.ADD}
            text={TASKS_PAGE_COPY.NEW_TASK}
            onClick={() => navigate(ROUTE_PATHS.NEW_TASK)}
          />
        )}
        {!isManager && (
          <Box component="span" sx={styles.caption}>
            {TASKS_PAGE_COPY.MANAGERS_ONLY}
          </Box>
        )}
      </Box>
      <TasksTable canClaim={canClaim} canChangeStatus={canChangeStatus} />
    </Box>
  );
};

export default TasksPage;
