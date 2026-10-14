import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProjectTeamCard from "./ProjectTeamCard";
import { usePageStyles } from "../../page.style";
import ProjectPageHeader from "./ProjectPageHeader";
import ProjectIntakeCard from "./ProjectIntakeCard";
import ProjectFilesSection from "./ProjectFilesSection";
import ProjectCustomerCard from "./ProjectCustomerCard";
import { useSessionUser } from "../../../store/session.store";
import type { IApiProject } from "../../../interfaces/api.interface";
import { hasPermission } from "../../../utilities/permission.utility";
import { buildEditProjectPath } from "../../../utilities/route.utility";

interface IStandaloneProjectViewProps {
  project: IApiProject;
}

const StandaloneProjectView: FC<IStandaloneProjectViewProps> = ({ project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const fieldSet = project.projectType?.detailFieldSet ?? null;
  const canEdit = hasPermission(sessionUser, "EDIT_PROJECTS");
  const openEditForm = () => navigate(buildEditProjectPath(project.id));

  return (
    <Box sx={styles.page}>
      <ProjectPageHeader project={project} />

      <ProjectTeamCard members={project.members ?? []} />

      <ProjectIntakeCard project={project} onEdit={canEdit ? openEditForm : null} />

      {fieldSet && (
        <ProjectCustomerCard
          project={project}
          fieldSet={fieldSet}
          onEdit={canEdit ? openEditForm : null}
          typeName={project.projectType?.name ?? ""}
        />
      )}

      <ProjectFilesSection projectId={project.id} />
    </Box>
  );
};

export default StandaloneProjectView;
