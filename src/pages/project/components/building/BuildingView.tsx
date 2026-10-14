import {
  toStageTiles,
  toStageFilter,
  formatBuildingBadge,
} from "../../../../utilities/apartment.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApartmentsTable from "./ApartmentsTable";
import ProjectTeamCard from "../ProjectTeamCard";
import ProjectTasksCard from "../ProjectTasksCard";
import { usePageStyles } from "../../../page.style";
import Chip from "../../../../components/Chip/Chip";
import ProjectPageHeader from "../ProjectPageHeader";
import ApartmentStagesCard from "./ApartmentStagesCard";
import ProjectFilesSection from "../ProjectFilesSection";
import ProjectCustomerCard from "../ProjectCustomerCard";
import Button from "../../../../components/Button/Button";
import BuildingInheritedCard from "./BuildingInheritedCard";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import { useSessionUser } from "../../../../store/session.store";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { hasPermission } from "../../../../utilities/permission.utility";
import { useProjectStagesQuery } from "../../../../hooks/queries/project.query";
import { useApartmentStageCountsQuery } from "../../../../hooks/queries/apartment.query";
import { buildEditProjectPath, buildNewApartmentPath } from "../../../../utilities/route.utility";
import { ALL_STAGES_TILE_ID, BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";

interface IBuildingViewProps {
  project: IApiProject;
}

const BuildingView: FC<IBuildingViewProps> = ({ project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const [activeTileId, setActiveTileId] = useState<string>(ALL_STAGES_TILE_ID);
  const stagesQuery = useProjectStagesQuery();
  const stageCountsQuery = useApartmentStageCountsQuery(project.id);

  const stages = stagesQuery.data ?? [];
  const stageCounts = stageCountsQuery.data ?? null;
  const fieldSet = project.projectType?.detailFieldSet ?? null;
  const canEdit = hasPermission(sessionUser, "EDIT_PROJECTS");
  const openEditForm = () => navigate(buildEditProjectPath(project.id));

  const addApartmentAction = (
    <Button
      icon={ICON_NAMES.ADD}
      text={BUILDING_PAGE_COPY.ADD_APARTMENT}
      onClick={() => navigate(buildNewApartmentPath(project.id))}
    />
  );

  return (
    <Box sx={styles.page}>
      <ProjectPageHeader
        project={project}
        extraActions={addApartmentAction}
        badge={<Chip label={formatBuildingBadge(stageCounts?.total ?? 0)} />}
      />

      <BuildingInheritedCard building={project} />

      <ApartmentStagesCard
        onSelect={setActiveTileId}
        activeTileId={activeTileId}
        tiles={toStageTiles(stages, stageCounts)}
      />

      <ApartmentsTable
        stages={stages}
        buildingId={project.id}
        stageId={toStageFilter(activeTileId)}
      />

      <ProjectTasksCard projectId={project.id} />

      <ProjectTeamCard members={project.members ?? []} />

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

export default BuildingView;
