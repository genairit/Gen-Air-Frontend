import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApartmentsTable from "./ApartmentsTable";
import ProjectTeamCard from "../ProjectTeamCard";
import ProjectDriveCard from "../ProjectDriveCard";
import ProjectTasksCard from "../ProjectTasksCard";
import { usePageStyles } from "../../../page.style";
import Chip from "../../../../components/Chip/Chip";
import ProjectPageHeader from "../ProjectPageHeader";
import ProjectTimelineCard from "../ProjectTimelineCard";
import ProjectCustomerCard from "../ProjectCustomerCard";
import Button from "../../../../components/Button/Button";
import BuildingInheritedCard from "./BuildingInheritedCard";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import { useSessionUser } from "../../../../store/session.store";
import { PERMISSIONS } from "../../../../constants/permission.constant";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { hasPermission } from "../../../../utilities/permission.utility";
import { formatBuildingBadge } from "../../../../utilities/apartment.utility";
import { BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";
import { ALL_STAGES_TILE_ID } from "../../../../constants/stage-tile.constant";
import { useProjectStagesQuery } from "../../../../hooks/queries/project.query";
import StageTilesCard from "../../../../components/StageTilesCard/StageTilesCard";
import { toStageTiles, toStageFilter } from "../../../../utilities/stage-tile.utility";
import { useApartmentStageCountsQuery } from "../../../../hooks/queries/apartment.query";
import { buildEditProjectPath, buildNewApartmentPath } from "../../../../utilities/route.utility";

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
  const canCreateApartment = hasPermission(sessionUser, PERMISSIONS.APARTMENTS_CREATE);
  const canReadDrive = hasPermission(sessionUser, PERMISSIONS.DRIVE_READ);
  const canReadTasks = hasPermission(sessionUser, PERMISSIONS.TASKS_READ);
  const canEdit = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const openEditForm = () => navigate(buildEditProjectPath(project.id));

  const addApartmentAction = canCreateApartment && (
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

      {canReadDrive && <ProjectDriveCard projectId={project.id} />}

      <BuildingInheritedCard building={project} />

      <StageTilesCard
        onSelect={setActiveTileId}
        activeTileId={activeTileId}
        title={BUILDING_PAGE_COPY.STAGES_TITLE}
        tiles={toStageTiles(stages, stageCounts)}
        subtitle={BUILDING_PAGE_COPY.STAGES_SUBTITLE}
      />

      <ApartmentsTable
        stages={stages}
        buildingId={project.id}
        stageId={toStageFilter(activeTileId)}
      />

      {canReadTasks && <ProjectTasksCard projectId={project.id} />}

      <ProjectTeamCard members={project.members ?? []} />

      {fieldSet && (
        <ProjectCustomerCard
          project={project}
          fieldSet={fieldSet}
          onEdit={canEdit ? openEditForm : null}
          typeName={project.projectType?.name ?? ""}
        />
      )}

      <ProjectTimelineCard projectId={project.id} />
    </Box>
  );
};

export default BuildingView;
