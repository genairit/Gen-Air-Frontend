import { PROJECT_VIEWS } from "./project-views";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getProjectKind } from "../../utilities/apartment.utility";
import { useProjectQuery } from "../../hooks/queries/project.query";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { PROJECT_PAGE_COPY, PROJECT_PAGE_STATUS_COPY } from "../../constants/project-page.constant";

const ProjectPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params[ROUTE_PARAMS.PROJECT_ID] ?? null;
  const projectQuery = useProjectQuery(projectId);

  if (projectQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING} />;
  }

  if (projectQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.BUILDING}
        title={PROJECT_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(projectQuery.error)}
        action={
          <Button
            text={PROJECT_PAGE_COPY.BACK_TO_BOARD}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => navigate(ROUTE_PATHS.BOARD)}
          />
        }
      />
    );
  }

  const project = projectQuery.data;
  const ProjectView = PROJECT_VIEWS[getProjectKind(project)];

  return <ProjectView key={project.id} project={project} />;
};

export default ProjectPage;
