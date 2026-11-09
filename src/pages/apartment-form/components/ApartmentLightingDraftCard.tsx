import {
  formatApartmentLighting,
  toApartmentLightingValues,
} from "../../../utilities/apartment.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import type { IApartmentFormValues } from "../../../interfaces/apartment.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import ProjectLightingFields from "../../project-form/components/ProjectLightingFields";
import { APARTMENT_LIGHTING_COPY, INHERITANCE_BADGES } from "../../../constants/apartment.constant";

interface IApartmentLightingDraftCardProps {
  building: IApiProject;
  isSubmitAttempted: boolean;
  values: IApartmentFormValues;
  onChange: (changes: Partial<IApartmentFormValues>) => void;
}

const ApartmentLightingDraftCard: FC<IApartmentLightingDraftCardProps> = ({
  values,
  building,
  onChange,
  isSubmitAttempted,
}) => {
  const styles = usePageStyles();
  const buildingValues = toApartmentLightingValues(building);
  const badge = INHERITANCE_BADGES[values.hasOwnLighting ? "overridden" : "building"];
  const toggleOverride = () =>
    onChange({
      ...buildingValues,
      hasOwnLighting: !values.hasOwnLighting,
    });

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={APARTMENT_LIGHTING_COPY.TITLE}
        subtitle={APARTMENT_LIGHTING_COPY.SUBTITLE}
      />
      <Box sx={styles.spacedRow}>
        <Chip label={badge.label} variant={badge.variant} />
        <Button
          onClick={toggleOverride}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={
            values.hasOwnLighting ? APARTMENT_LIGHTING_COPY.RESET : APARTMENT_LIGHTING_COPY.OVERRIDE
          }
        />
      </Box>
      {values.hasOwnLighting ? (
        <ProjectLightingFields
          values={values}
          onChange={onChange}
          isSubmitAttempted={isSubmitAttempted}
          subtitle={APARTMENT_LIGHTING_COPY.FORM_SUBTITLE}
        />
      ) : (
        <DetailTile
          isLtr
          label={APARTMENT_LIGHTING_COPY.VALUE_LABEL}
          value={formatApartmentLighting(buildingValues)}
        />
      )}
    </Card>
  );
};

export default ApartmentLightingDraftCard;
