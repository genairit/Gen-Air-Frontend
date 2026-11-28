import { type FC } from "react";
import { Box } from "@mui/material";
import ApartmentsTable from "./ApartmentsTable";
import { usePageStyles } from "../../../page.style";
import Tabs from "../../../../components/Tabs/Tabs";
import Button from "../../../../components/Button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import { useSessionUser } from "../../../../store/session.store";
import { PERMISSIONS } from "../../../../constants/permission.constant";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { hasPermission } from "../../../../utilities/permission.utility";
import { buildNewApartmentPath } from "../../../../utilities/route.utility";
import { useApartmentImport } from "../../../../hooks/apartment-import.hook";
import { BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";
import { ALL_STAGES_TILE_ID } from "../../../../constants/stage-tile.constant";
import { useProjectStagesQuery } from "../../../../hooks/queries/project.query";
import ApartmentImport from "../../../../components/ApartmentImport/ApartmentImport";
import { toStageTiles, toStageFilter } from "../../../../utilities/stage-tile.utility";
import { useApartmentStageCountsQuery } from "../../../../hooks/queries/apartment.query";
import { useProjectWorkspaceQuery } from "../../../../hooks/project-workspace-query.hook";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";
import { canImportApartments } from "../../../../utilities/apartment-import-permission.utility";

interface IBuildingApartmentsPanelProps {
  project: IApiProject;
}

const BuildingApartmentsPanel: FC<IBuildingApartmentsPanelProps> = ({ project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const location = useLocation();
  const { params, update } = useProjectWorkspaceQuery();
  const activeTileId = params.get("apartmentStage") ?? ALL_STAGES_TILE_ID;
  const setActiveTileId = (id: string) => update("apartmentStage", id, true);
  const apartmentImport = useApartmentImport(project.id);
  const stagesQuery = useProjectStagesQuery();
  const stageCountsQuery = useApartmentStageCountsQuery(project.id);

  const stages = stagesQuery.data ?? [];
  const stageCounts = stageCountsQuery.data ?? null;
  const canCreateApartment = hasPermission(sessionUser, PERMISSIONS.APARTMENTS_CREATE);
  const canImport = canImportApartments(sessionUser);
  const importOpen = canImport && apartmentImport.open;

  const importAction = canImport ? (
    <Button
      size="compact"
      icon={ICON_NAMES.UPLOAD}
      text="ייבוא דירות מאקסל"
      variant={BUTTON_VARIANTS.NEUTRAL}
      onClick={apartmentImport.openImport}
    />
  ) : null;
  const addApartmentAction = (
    <>
      {canCreateApartment && (
        <Button
          size="compact"
          icon={ICON_NAMES.ADD}
          text={BUILDING_PAGE_COPY.ADD_APARTMENT}
          onClick={() =>
            navigate(buildNewApartmentPath(project.id), {
              state: { buildingSearch: location.search },
            })
          }
        />
      )}
      {importAction}
    </>
  );

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <ApartmentImport
        open={importOpen}
        view={apartmentImport.view}
        buildingName={project.name}
        onRetry={apartmentImport.retry}
        onFinish={apartmentImport.finish}
        onClose={apartmentImport.closeImport}
        existingCount={stageCounts?.total ?? 0}
        onFilesSelected={apartmentImport.selectFiles}
        onDownloadReport={apartmentImport.downloadReport}
        onDownloadTemplate={apartmentImport.downloadTemplate}
      />
      <Box sx={styles.spacedRow}>
        <Tabs
          activeId={activeTileId}
          onChange={setActiveTileId}
          items={toStageTiles(stages, stageCounts)}
          ariaLabel={BUILDING_PAGE_COPY.STAGES_TITLE}
        />
        <Box sx={styles.row({ gap: "8px" })}>{addApartmentAction}</Box>
      </Box>

      <ApartmentsTable
        stages={stages}
        buildingId={project.id}
        stageId={toStageFilter(activeTileId)}
      />
    </Box>
  );
};

export default BuildingApartmentsPanel;
