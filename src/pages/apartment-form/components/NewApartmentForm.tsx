import {
  formatBuildingEyebrow,
  countInvalidApartmentFields,
} from "../../../utilities/apartment.utility";

import {
  ADD_APARTMENT_COPY,
  EMPTY_APARTMENT_FORM,
  APARTMENT_UNIT_FIELDS,
  APARTMENT_PEOPLE_FIELDS,
} from "../../../constants/apartment.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import ApartmentFieldsCard from "./ApartmentFieldsCard";
import InheritedPreviewCard from "./InheritedPreviewCard";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IApartmentFormValues } from "../../../interfaces/apartment.interface";
import { buildApartmentPath, buildProjectPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useCreateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";

interface INewApartmentFormProps {
  building: IApiProject;
}

const NewApartmentForm: FC<INewApartmentFormProps> = ({ building }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const [values, setValues] = useState<IApartmentFormValues>(EMPTY_APARTMENT_FORM);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const createMutation = useCreateApartmentMutation();

  const invalidFieldCount = countInvalidApartmentFields(values);
  const showFieldErrors = isSubmitAttempted && invalidFieldCount > 0;

  const updateValues = (changes: Partial<IApartmentFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleSubmit = () => {
    setIsSubmitAttempted(true);

    if (invalidFieldCount > 0) {
      return;
    }

    createMutation.mutate(
      { buildingId: building.id, values },
      { onSuccess: apartmentId => navigate(buildApartmentPath(building.id, apartmentId)) },
    );
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Box component="span" sx={styles.eyebrow}>
          {formatBuildingEyebrow(building.name)}
        </Box>
        <Box component="h1" sx={styles.heading}>
          {ADD_APARTMENT_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.description}>
          {ADD_APARTMENT_COPY.DESCRIPTION}
        </Box>
      </Box>

      <ApartmentFieldsCard
        values={values}
        minColumnWidth={240}
        icon={ICON_NAMES.HOME}
        onChange={updateValues}
        fields={APARTMENT_UNIT_FIELDS}
        title={ADD_APARTMENT_COPY.UNIT_TITLE}
        isSubmitAttempted={isSubmitAttempted}
      />

      <ApartmentFieldsCard
        values={values}
        minColumnWidth={200}
        onChange={updateValues}
        icon={ICON_NAMES.CUSTOMER}
        fields={APARTMENT_PEOPLE_FIELDS}
        isSubmitAttempted={isSubmitAttempted}
        title={ADD_APARTMENT_COPY.PEOPLE_TITLE}
        subtitle={ADD_APARTMENT_COPY.PEOPLE_SUBTITLE}
      />

      <InheritedPreviewCard building={building} />

      {showFieldErrors && <InlineError message={formatFieldErrorCount(invalidFieldCount)} />}
      {createMutation.isError && <InlineError message={getApiErrorMessage(createMutation.error)} />}

      <Box sx={styles.row({})}>
        <Button
          icon={ICON_NAMES.ADD}
          onClick={handleSubmit}
          text={ADD_APARTMENT_COPY.SUBMIT}
          isLoading={createMutation.isPending}
        />
        <Button
          text={ADD_APARTMENT_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(buildProjectPath(building.id))}
        />
      </Box>
    </Box>
  );
};

export default NewApartmentForm;
