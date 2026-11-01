import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import TasksTable from "./components/TasksTable";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { TASKS_PAGE_COPY } from "../../constants/task.constant";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";

const TasksPage = () => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canClaim = hasPermission(sessionUser, PERMISSIONS.TASKS_CLAIM);
  const canChangeStatus = hasPermission(sessionUser, PERMISSIONS.TASKS_STATUS_UPDATE);

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
      </Box>
      <TasksTable canClaim={canClaim} canChangeStatus={canChangeStatus} />
    </Box>
  );
};

export default TasksPage;
