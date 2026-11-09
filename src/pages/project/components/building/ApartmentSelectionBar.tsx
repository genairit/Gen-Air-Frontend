import {
  toOptions,
  getOptionLabels,
  findOptionIdByLabel,
} from "../../../../utilities/option.utility";

import {
  formatSelectedApartments,
  formatBulkWaitingReasonTitle,
  formatBulkWaitingReasonContext,
} from "../../../../utilities/apartment.utility";

import type { FC } from "react";
import Button from "../../../../components/Button/Button";
import { useSessionUser } from "../../../../store/session.store";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import ActionBar from "../../../../components/ActionBar/ActionBar";
import { PERMISSIONS } from "../../../../constants/permission.constant";
import { hasPermission } from "../../../../utilities/permission.utility";
import InlineError from "../../../../components/InlineError/InlineError";
import Autocomplete from "../../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../../interfaces/api.interface";
import { getApiErrorMessage } from "../../../../utilities/api-error.utility";
import { useStageReasonGate } from "../../../../hooks/stage-reason-gate.hook";
import { BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";
import StageReasonPopup from "../../../../components/StageReasonPopup/StageReasonPopup";
import { useMoveApartmentsMutation } from "../../../../hooks/mutations/apartment.mutation";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";

interface IApartmentSelectionBarProps {
  onClear: () => void;
  apartmentIds: string[];
  stages: IApiProjectStage[];
}

const ApartmentSelectionBar: FC<IApartmentSelectionBarProps> = ({
  stages,
  onClear,
  apartmentIds,
}) => {
  const user = useSessionUser();
  const canChangeStatus = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const moveMutation = useMoveApartmentsMutation();
  const stageOptions = toOptions(stages);
  const selectedCount = apartmentIds.length;

  const stageGate = useStageReasonGate({
    onCancel: moveMutation.reset,
    moveWithReason: move => moveMutation.mutateAsync({ ...move, apartmentIds }).then(onClear),
    moveToStage: stageId => moveMutation.mutate({ stageId, apartmentIds }, { onSuccess: onClear }),
  });

  const isMoveErrorVisible = moveMutation.isError && !stageGate.isReasonOpen;

  const moveToStage = (stageLabel: string | null) => {
    const stageId = findOptionIdByLabel(stageOptions, stageLabel);

    if (!stageId) {
      return;
    }

    stageGate.requestStage(stageId);
  };

  if (!canChangeStatus) {
    return null;
  }

  return (
    <>
      <ActionBar captionIcon={ICON_NAMES.DONE} caption={formatSelectedApartments(selectedCount)}>
        <Autocomplete
          value={null}
          isAutocomplete={false}
          onChange={moveToStage}
          disabled={moveMutation.isPending}
          options={getOptionLabels(stageOptions)}
          placeholder={BUILDING_PAGE_COPY.CHANGE_STAGE}
        />
        <Button
          onClick={onClear}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={BUILDING_PAGE_COPY.CLEAR_SELECTION}
        />
      </ActionBar>
      {isMoveErrorVisible && <InlineError message={getApiErrorMessage(moveMutation.error)} />}
      <StageReasonPopup
        open={stageGate.isReasonOpen}
        onCancel={stageGate.cancelReason}
        onConfirm={stageGate.confirmReason}
        title={formatBulkWaitingReasonTitle(selectedCount)}
        contextText={formatBulkWaitingReasonContext(selectedCount)}
      />
    </>
  );
};

export default ApartmentSelectionBar;
