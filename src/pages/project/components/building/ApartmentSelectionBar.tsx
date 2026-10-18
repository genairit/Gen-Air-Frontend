import type { FC } from "react";
import Button from "../../../../components/Button/Button";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import ActionBar from "../../../../components/ActionBar/ActionBar";
import InlineError from "../../../../components/InlineError/InlineError";
import Autocomplete from "../../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../../interfaces/api.interface";
import { getApiErrorMessage } from "../../../../utilities/api-error.utility";
import { BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";
import { formatSelectedApartments } from "../../../../utilities/apartment.utility";
import { useMoveApartmentsMutation } from "../../../../hooks/mutations/apartment.mutation";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";
import {
  toOptions,
  getOptionLabels,
  findOptionIdByLabel,
} from "../../../../utilities/option.utility";

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
  const moveMutation = useMoveApartmentsMutation();
  const stageOptions = toOptions(stages);

  const moveToStage = (stageLabel: string | null) => {
    const stageId = findOptionIdByLabel(stageOptions, stageLabel);

    if (!stageId) {
      return;
    }

    moveMutation.mutate({ stageId, apartmentIds }, { onSuccess: onClear });
  };

  return (
    <>
      <ActionBar
        captionIcon={ICON_NAMES.DONE}
        caption={formatSelectedApartments(apartmentIds.length)}
      >
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
      {moveMutation.isError && <InlineError message={getApiErrorMessage(moveMutation.error)} />}
    </>
  );
};

export default ApartmentSelectionBar;
