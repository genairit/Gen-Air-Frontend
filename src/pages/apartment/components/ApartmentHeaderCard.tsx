import {
  toStageTabs,
  formatBuildingEyebrow,
  findApartmentPosition,
  formatApartmentHeading,
  formatApartmentPosition,
} from "../../../utilities/apartment.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { type FC, useRef, type ReactNode } from "react";
import { useStyles } from "./ApartmentHeaderCard.style";
import { useSessionUser } from "../../../store/session.store";
import { TABS_VARIANTS } from "../../../constants/tabs.constant";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { focusActiveTab } from "../../../utilities/focus.utility";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { buildApartmentPath } from "../../../utilities/route.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useStageReasonGate } from "../../../hooks/stage-reason-gate.hook";
import { getApartmentBuildingPath } from "../../../utilities/route.utility";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { STAGE_REASON_COPY } from "../../../constants/project-stage.constant";
import WaitingReasonBanner from "../../project/components/WaitingReasonBanner";
import { useAllApartmentsQuery } from "../../../hooks/queries/apartment.query";
import StageReasonPopup from "../../../components/StageReasonPopup/StageReasonPopup";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";
import { useMoveApartmentsMutation } from "../../../hooks/mutations/apartment.mutation";

interface IApartmentHeaderCardProps {
  children?: ReactNode;
  building: IApiProject;
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentHeaderCard: FC<IApartmentHeaderCardProps> = ({
  stages,
  building,
  apartment,
  children,
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const buildingSearch: unknown = location.state?.buildingSearch;
  const user = useSessionUser();
  const canChangeStatus = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const stageTabsRef = useRef<HTMLDivElement>(null);
  const siblingsQuery = useAllApartmentsQuery(building.id);
  const moveMutation = useMoveApartmentsMutation();

  const position = findApartmentPosition(siblingsQuery.data ?? [], apartment.id);

  const stageGate = useStageReasonGate({
    onCancel: moveMutation.reset,
    moveToStage: stageId => moveMutation.mutate({ stageId, apartmentIds: [apartment.id] }),
    moveWithReason: move => moveMutation.mutateAsync({ ...move, apartmentIds: [apartment.id] }),
  });

  const isMoveErrorVisible = moveMutation.isError && !stageGate.isReasonOpen;

  const openSibling = (apartmentId: string | null) => {
    if (!apartmentId) {
      return;
    }

    navigate(
      { pathname: buildApartmentPath(building.id, apartmentId), search: location.search },
      { state: { buildingSearch } },
    );
  };

  const moveToStage = (stageId: string) => {
    if (stageId === apartment.stageId || moveMutation.isPending) {
      return;
    }

    stageGate.requestStage(stageId);
  };

  return (
    <Card gap="8px" padding="12px 16px">
      <Box component="nav" sx={styles.breadcrumb}>
        <Box component={Link} sx={styles.crumbLink} to={ROUTE_PATHS.BOARD}>
          {APARTMENT_PAGE_COPY.BOARD}
        </Box>
        ›
        <Box
          component={Link}
          sx={styles.crumbLink}
          to={getApartmentBuildingPath(building.id, buildingSearch)}
        >
          {formatBuildingEyebrow(building.name)}
        </Box>
      </Box>

      <Box sx={styles.identity}>
        <Box sx={styles.details}>
          <Box sx={styles.titleRow}>
            <Box component="h1" sx={styles.title}>
              {formatApartmentHeading(apartment)}
            </Box>
            <Chip isMonospace label={apartment.code} variant={CHIP_VARIANTS.INSET} />
          </Box>
          {position.position > 0 && (
            <Box component="span" sx={styles.stageLabel}>
              {formatApartmentPosition(position, building.name)}
            </Box>
          )}
        </Box>
        <Box sx={styles.titleRow}>
          <Box component="b" sx={styles.stageTitle}>
            {APARTMENT_PAGE_COPY.STAGE_TITLE}
          </Box>
          {canChangeStatus ? (
            <Tabs
              ref={stageTabsRef}
              onChange={moveToStage}
              items={toStageTabs(stages)}
              activeId={apartment.stageId}
              variant={TABS_VARIANTS.STATUS}
              disabled={moveMutation.isPending}
              ariaLabel={APARTMENT_PAGE_COPY.STAGE_TITLE}
            />
          ) : (
            <Chip
              label={
                apartment.stage?.name ??
                stages.find(stage => stage.id === apartment.stageId)?.name ??
                "—"
              }
            />
          )}
        </Box>
        <Box sx={styles.titleRow}>
          <Button
            size={BUTTON_SIZES.COMPACT}
            disabled={!position.previousId}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={APARTMENT_PAGE_COPY.PREVIOUS}
            onClick={() => openSibling(position.previousId)}
          />
          <Button
            size={BUTTON_SIZES.COMPACT}
            disabled={!position.nextId}
            text={APARTMENT_PAGE_COPY.NEXT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => openSibling(position.nextId)}
          />
        </Box>
      </Box>

      <WaitingReasonBanner project={apartment} />
      {isMoveErrorVisible && <InlineError message={getApiErrorMessage(moveMutation.error)} />}
      {children}
      <StageReasonPopup
        open={stageGate.isReasonOpen}
        title={STAGE_REASON_COPY.TITLE}
        onCancel={stageGate.cancelReason}
        onConfirm={stageGate.confirmReason}
        contextText={APARTMENT_PAGE_COPY.WAITING_REASON_CONTEXT}
        onCancelClosed={() => focusActiveTab(stageTabsRef.current)}
      />
    </Card>
  );
};

export default ApartmentHeaderCard;
