import {
  toStageTabs,
  formatApartmentNumber,
  formatBuildingEyebrow,
  findApartmentPosition,
  formatApartmentHeading,
  formatApartmentPosition,
} from "../../../utilities/apartment.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ApartmentHeaderCard.style";
import IconTile from "../../../components/IconTile/IconTile";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { ICON_TILE_SIZES } from "../../../constants/icon-tile.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { useAllApartmentsQuery } from "../../../hooks/queries/apartment.query";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";
import { useMoveApartmentsMutation } from "../../../hooks/mutations/apartment.mutation";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { buildApartmentPath, buildProjectPath } from "../../../utilities/route.utility";

interface IApartmentHeaderCardProps {
  building: IApiProject;
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentHeaderCard: FC<IApartmentHeaderCardProps> = ({ stages, building, apartment }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const user = useSessionUser();
  const canChangeStatus = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const siblingsQuery = useAllApartmentsQuery(building.id);
  const moveMutation = useMoveApartmentsMutation();

  const position = findApartmentPosition(siblingsQuery.data ?? [], apartment.id);

  const openSibling = (apartmentId: string | null) => {
    if (!apartmentId) {
      return;
    }

    navigate(buildApartmentPath(building.id, apartmentId));
  };

  const moveToStage = (stageId: string) =>
    moveMutation.mutate({ stageId, apartmentIds: [apartment.id] });

  return (
    <Card gap="18px">
      <Box component="nav" sx={styles.breadcrumb}>
        <Box component={Link} sx={styles.crumbLink} to={ROUTE_PATHS.BOARD}>
          {APARTMENT_PAGE_COPY.BOARD}
        </Box>
        ›
        <Box component={Link} sx={styles.crumbLink} to={buildProjectPath(building.id)}>
          {formatBuildingEyebrow(building.name)}
        </Box>
        ›
        <Box component="span" sx={styles.currentCrumb}>
          {formatApartmentNumber(apartment)}
        </Box>
      </Box>

      <Box sx={styles.identity}>
        <Box sx={styles.titleBlock}>
          <IconTile
            name={ICON_NAMES.HOME}
            size={ICON_TILE_SIZES.LARGE}
            depth={SURFACE_DEPTHS.INSET}
          />
          <Box sx={styles.details}>
            <Box sx={styles.titleRow}>
              <Box component="h3" sx={styles.title}>
                {formatApartmentHeading(apartment)}
              </Box>
              <Chip isMonospace label={apartment.code} variant={CHIP_VARIANTS.INSET} />
              <Chip label={APARTMENT_PAGE_COPY.SUB_PROJECT} />
            </Box>
            {position.position > 0 && (
              <Box component="span" sx={styles.stageLabel}>
                {formatApartmentPosition(position, building.name)}
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={styles.titleRow}>
          <Button
            disabled={!position.previousId}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={APARTMENT_PAGE_COPY.PREVIOUS}
            onClick={() => openSibling(position.previousId)}
          />
          <Button
            disabled={!position.nextId}
            text={APARTMENT_PAGE_COPY.NEXT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => openSibling(position.nextId)}
          />
        </Box>
      </Box>

      <Box component="span" sx={styles.stageLabel}>
        <Box component="b" sx={styles.stageTitle}>
          {APARTMENT_PAGE_COPY.STAGE_TITLE}
        </Box>
        {`· ${APARTMENT_PAGE_COPY.STAGE_HINT}`}
      </Box>
      <Tabs
        isFullWidth
        onChange={moveToStage}
        disabled={!canChangeStatus}
        items={toStageTabs(stages)}
        activeId={apartment.stageId}
      />
      {moveMutation.isError && <InlineError message={getApiErrorMessage(moveMutation.error)} />}
    </Card>
  );
};

export default ApartmentHeaderCard;
