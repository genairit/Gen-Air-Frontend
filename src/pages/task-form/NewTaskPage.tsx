import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import NewTaskForm from "./components/NewTaskForm";
import Button from "../../components/Button/Button";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { hasPermission } from "../../utilities/permission.utility";
import { useProjectQuery } from "../../hooks/queries/project.query";
import LoadingState from "../../components/LoadingState/LoadingState";
import { PROJECT_PAGE_STATUS_COPY } from "../../constants/project-page.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { NEW_TASK_COPY, NEW_TASK_PROJECT_PARAM } from "../../constants/task.constant";

const NewTaskPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get(NEW_TASK_PROJECT_PARAM);
  const projectQuery = useProjectQuery(projectId);

  if (!hasPermission(sessionUser, "MANAGE_TASKS")) {
    return (
      <EmptyState
        icon={ICON_NAMES.TASKS}
        title={NEW_TASK_COPY.DENIED_TITLE}
        description={NEW_TASK_COPY.DENIED_DESCRIPTION}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={NEW_TASK_COPY.BACK_TO_TASKS}
            onClick={() => navigate(ROUTE_PATHS.TASKS)}
          />
        }
      />
    );
  }

  if (projectId && projectQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING} />;
  }

  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Box component="span" sx={styles.eyebrow}>
          {NEW_TASK_COPY.EYEBROW}
        </Box>
        <Box component="h1" sx={styles.heading}>
          {NEW_TASK_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.description}>
          {NEW_TASK_COPY.DESCRIPTION}
        </Box>
      </Box>
      <NewTaskForm key={projectId ?? "new"} initialProject={projectQuery.data ?? null} />
    </Box>
  );
};

export default NewTaskPage;
