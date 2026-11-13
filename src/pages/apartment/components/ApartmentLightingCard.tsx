import {
  formatApartmentLighting,
  toApartmentLightingValues,
} from "../../../utilities/apartment.utility";

import {
  INHERITANCE_BADGES,
  APARTMENT_PAGE_COPY,
  APARTMENT_LIGHTING_COPY,
} from "../../../constants/apartment.constant";

import {
  toLightingPayload,
  getLightingHeightError,
} from "../../../utilities/project-constraints.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import ProjectLightingFields from "../../project-form/components/ProjectLightingFields";
import type { IProjectLightingFormValues } from "../../../interfaces/project.interface";
import { useUpdateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";

interface IApartmentLightingCardProps {
  canEdit: boolean;
  apartment: IApiProject;
}

const ApartmentLightingCard: FC<IApartmentLightingCardProps> = ({ apartment, canEdit }) => {
  const styles = usePageStyles();
  const [draft, setDraft] = useState<IProjectLightingFormValues | null>(null);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const updateMutation = useUpdateApartmentMutation();
  const badge = INHERITANCE_BADGES[apartment.hasOwnLighting ? "overridden" : "building"];
  const effectiveValues = toApartmentLightingValues(apartment);

  const startEditing = () => {
    setIsSubmitAttempted(false);
    setDraft(effectiveValues);
  };
  const saveLighting = () => {
    if (!draft) {
      return;
    }

    setIsSubmitAttempted(true);
    if (getLightingHeightError(draft)) {
      return;
    }

    updateMutation.mutate(
      { apartmentId: apartment.id, changes: { hasOwnLighting: true, ...toLightingPayload(draft) } },
      { onSuccess: () => setDraft(null) },
    );
  };
  const resetLighting = () =>
    updateMutation.mutate(
      { apartmentId: apartment.id, changes: { hasOwnLighting: false } },
      { onSuccess: () => setDraft(null) },
    );

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={APARTMENT_LIGHTING_COPY.TITLE}
        subtitle={APARTMENT_LIGHTING_COPY.SUBTITLE}
      />
      <Box sx={styles.spacedRow}>
        <Chip label={badge.label} variant={badge.variant} />
        {canEdit && (
          <Box sx={styles.row({ gap: "10px" })}>
            {!draft && (
              <Button
                onClick={startEditing}
                variant={BUTTON_VARIANTS.NEUTRAL}
                disabled={updateMutation.isPending}
                text={APARTMENT_LIGHTING_COPY.OVERRIDE}
              />
            )}
            {apartment.hasOwnLighting && (
              <Button
                onClick={resetLighting}
                variant={BUTTON_VARIANTS.NEUTRAL}
                isLoading={updateMutation.isPending}
                text={APARTMENT_LIGHTING_COPY.RESET}
              />
            )}
          </Box>
        )}
      </Box>
      {draft ? (
        <>
          <ProjectLightingFields
            values={draft}
            isSubmitAttempted={isSubmitAttempted}
            subtitle={APARTMENT_LIGHTING_COPY.FORM_SUBTITLE}
            onChange={changes => setDraft(current => current && { ...current, ...changes })}
          />
          <Box sx={styles.row({ gap: "10px" })}>
            <Button
              onClick={saveLighting}
              text={APARTMENT_LIGHTING_COPY.SAVE}
              isLoading={updateMutation.isPending}
            />
            <Button
              onClick={() => setDraft(null)}
              text={APARTMENT_PAGE_COPY.CANCEL}
              variant={BUTTON_VARIANTS.NEUTRAL}
              disabled={updateMutation.isPending}
            />
          </Box>
        </>
      ) : (
        <DetailTile
          isLtr
          label={APARTMENT_LIGHTING_COPY.VALUE_LABEL}
          value={formatApartmentLighting(effectiveValues)}
        />
      )}
      {updateMutation.isError && <InlineError message={getApiErrorMessage(updateMutation.error)} />}
    </Card>
  );
};

export default ApartmentLightingCard;
