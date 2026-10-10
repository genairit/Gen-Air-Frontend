import {
  ALL_USERS_QUERY,
  PROJECT_FORM_COPY,
  PROJECT_FORM_MODES,
  PROJECT_FORM_MODE_COPY,
  type ProjectFormModeType,
} from "../../../constants/project-form.constant";

import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "../../../hooks/mutations/project.mutation";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectTypeCard from "./ProjectTypeCard";
import { usePageStyles } from "../../page.style";
import Chip from "../../../components/Chip/Chip";
import ProjectRolesCard from "./ProjectRolesCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import ActionBar from "../../../components/ActionBar/ActionBar";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { UserRoleType } from "../../../constants/user-role.constant";
import type { IProjectFormValues } from "../../../interfaces/project.interface";
import { toProjectTypeOption } from "../../../utilities/mappers/project.mapper";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { buildProjectPath, getProjectFormCancelPath } from "../../../utilities/route.utility";
import { canSubmitProjectForm, toProjectFormValues } from "../../../utilities/project.utility";
import { useProjectStagesQuery, useProjectTypesQuery } from "../../../hooks/queries/project.query";

interface IProjectFormProps {
  mode: ProjectFormModeType;
  project: IApiProject | null;
}

const ProjectForm: FC<IProjectFormProps> = ({ mode, project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const copy = PROJECT_FORM_MODE_COPY[mode];
  const projectId = project?.id ?? null;
  const isEditMode = mode === PROJECT_FORM_MODES.EDIT;
  const [values, setValues] = useState<IProjectFormValues>(() => toProjectFormValues(project));

  const usersQuery = useUsersQuery(ALL_USERS_QUERY);
  const typesQuery = useProjectTypesQuery();
  const stagesQuery = useProjectStagesQuery();
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canDelete = isEditMode && hasPermission(sessionUser, "DELETE_PROJECTS");

  const openProject = (savedProjectId: string) => navigate(buildProjectPath(savedProjectId));

  const submitByMode: Record<ProjectFormModeType, () => void> = {
    new: () => createMutation.mutate(values, { onSuccess: openProject }),
    edit: () =>
      updateMutation.mutate({ projectId: projectId ?? "", values }, { onSuccess: openProject }),
  };

  const updateValues = (changes: Partial<IProjectFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleAssigneeChange = (role: UserRoleType, userId: string | null) =>
    setValues(current => ({ ...current, assignees: { ...current.assignees, [role]: userId } }));

  const handleDelete = () => {
    if (!projectId) {
      return;
    }

    deleteMutation.mutate(projectId, { onSuccess: () => navigate(ROUTE_PATHS.BOARD) });
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.row({})}>
        <Box component="h1" sx={styles.heading}>
          {copy.title}
        </Box>
        {project && <Chip isMonospace label={project.code} size={CHIP_SIZES.MEDIUM} />}
      </Box>

      <ProjectDetailsCard
        mode={mode}
        values={values}
        onChange={updateValues}
        stages={stagesQuery.data ?? []}
        projectCode={project?.code ?? null}
      />
      <ProjectTypeCard
        selectedTypeId={values.typeId}
        onSelect={typeId => updateValues({ typeId })}
        options={(typesQuery.data ?? []).map(toProjectTypeOption)}
      />
      <ProjectRolesCard
        assignees={values.assignees}
        users={usersQuery.data ?? []}
        onAssigneeChange={handleAssigneeChange}
      />

      {mutationError && <InlineError message={getApiErrorMessage(mutationError)} />}

      <ActionBar captionIcon={ICON_NAMES.INFO} caption={PROJECT_FORM_COPY.NOTICE}>
        {canDelete && (
          <Button
            onClick={handleDelete}
            icon={ICON_NAMES.DELETE}
            text={PROJECT_FORM_COPY.DELETE}
            variant={BUTTON_VARIANTS.DANGER}
            isLoading={deleteMutation.isPending}
          />
        )}
        <Button
          text={PROJECT_FORM_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(getProjectFormCancelPath(projectId))}
        />
        <Button
          isLoading={isSaving}
          icon={copy.submitIcon}
          text={copy.submitLabel}
          onClick={submitByMode[mode]}
          disabled={!canSubmitProjectForm(values)}
        />
      </ActionBar>
    </Box>
  );
};

export default ProjectForm;
