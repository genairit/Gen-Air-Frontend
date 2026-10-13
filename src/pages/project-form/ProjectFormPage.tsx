import type { FC } from "react";
import ProjectForm from "./components/ProjectForm";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useProjectQuery } from "../../hooks/queries/project.query";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { PROJECT_PAGE_COPY } from "../../constants/project-page.constant";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { PROJECT_FORM_COPY, type ProjectFormModeType } from "../../constants/project-form.constant";

interface IProjectFormPageProps {
  mode: ProjectFormModeType;
}

const ProjectFormPage: FC<IProjectFormPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const user = useSessionUser();
  const params = useParams();
  const projectId = params[ROUTE_PARAMS.PROJECT_ID] ?? null;
  const projectQuery = useProjectQuery(projectId);

  if (!projectId) {
    return <ProjectForm mode={mode} project={null} key={`${mode}:${user?.id ?? "anonymous"}`} />;
  }

  if (projectQuery.isPending) {
    return <LoadingState label={PROJECT_FORM_COPY.LOADING} />;
  }

  if (projectQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.BUILDING}
        title={PROJECT_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(projectQuery.error)}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PROJECT_PAGE_COPY.BACK_TO_BOARD}
            onClick={() => navigate(ROUTE_PATHS.BOARD)}
          />
        }
      />
    );
  }

  return (
    <ProjectForm
      mode={mode}
      project={projectQuery.data}
      key={`${mode}:${user?.id ?? "anonymous"}:${projectQuery.data.id}`}
    />
  );
};

export default ProjectFormPage;
