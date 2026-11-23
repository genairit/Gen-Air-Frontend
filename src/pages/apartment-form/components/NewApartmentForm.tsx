import {
  formatBuildingEyebrow,
  countInvalidApartmentFields,
} from "../../../utilities/apartment.utility";

import {
  ADD_APARTMENT_COPY,
  EMPTY_APARTMENT_FORM,
  APARTMENT_UNIT_FIELDS,
} from "../../../constants/apartment.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import ApartmentFieldsCard from "./ApartmentFieldsCard";
import InheritedPreviewCard from "./InheritedPreviewCard";
import { useSessionUser } from "../../../store/session.store";
import ApartmentTeamDraftCard from "./ApartmentTeamDraftCard";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { buildProjectPath } from "../../../utilities/route.utility";
import { PERMISSIONS } from "../../../constants/permission.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import { hasPermission } from "../../../utilities/permission.utility";
import ApartmentLightingDraftCard from "./ApartmentLightingDraftCard";
import InlineError from "../../../components/InlineError/InlineError";
import { useCustomerQuery } from "../../../hooks/queries/customer.query";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { isCustomerSelectable } from "../../../utilities/customer.utility";
import type { IApartmentFormValues } from "../../../interfaces/apartment.interface";
import { formatApartmentValidationCount } from "../../../utilities/apartment.utility";
import type { ICustomerContact } from "../../../interfaces/customer-contact.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useCreateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
import type { ProjectContactRoleType } from "../../../constants/project-contact-role.constant";
import ProjectCustomerPickerCard from "../../project-form/components/ProjectCustomerPickerCard";
import ProjectRoleContactsCard from "../../../components/ProjectContactRoles/ProjectRoleContactsCard";
import {
  emptyProjectRoleContacts,
  setProjectRoleContact,
  projectRoleContactInputs,
} from "../../../utilities/project-contact-role.utility";

interface INewApartmentFormProps {
  building: IApiProject;
}

const NewApartmentForm: FC<INewApartmentFormProps> = ({ building }) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const [roleContacts, setRoleContacts] = useState(emptyProjectRoleContacts);
  const [values, setValues] = useState<IApartmentFormValues>(EMPTY_APARTMENT_FORM);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const createMutation = useCreateApartmentMutation();
  const customerQuery = useCustomerQuery(values.customerId);

  const isCustomerReady = isCustomerSelectable(customerQuery.data);
  const invalidSelectedCustomerCount = Number(Boolean(values.customerId) && !isCustomerReady);
  const invalidFieldCount = countInvalidApartmentFields(values) + invalidSelectedCustomerCount;
  const showFieldErrors = isSubmitAttempted && invalidFieldCount > 0;

  const canEditContactDetails = hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_UPDATE);
  const changeRoleContact = (role: ProjectContactRoleType, contact: ICustomerContact | null) => {
    const next = setProjectRoleContact(roleContacts, role, contact);
    setRoleContacts(next);
  };

  const updateValues = (changes: Partial<IApartmentFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleSubmit = () => {
    setIsSubmitAttempted(true);

    if (invalidFieldCount > 0 || createMutation.isPending) {
      return;
    }

    createMutation.mutate(
      { buildingId: building.id, values, contacts: projectRoleContactInputs(roleContacts) },
      { onSuccess: () => navigate(buildProjectPath(building.id)) },
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

      <Box sx={styles.grid({ minColumnWidth: 500 })}>
        <ApartmentFieldsCard
          values={values}
          minColumnWidth={240}
          icon={ICON_NAMES.HOME}
          onChange={updateValues}
          fields={APARTMENT_UNIT_FIELDS}
          title={ADD_APARTMENT_COPY.UNIT_TITLE}
          isSubmitAttempted={isSubmitAttempted}
        />
        <ProjectCustomerPickerCard
          isApartment
          customerId={values.customerId}
          isSubmitAttempted={isSubmitAttempted}
          title={ADD_APARTMENT_COPY.PEOPLE_TITLE}
          subtitle={ADD_APARTMENT_COPY.PEOPLE_SUBTITLE}
          onChange={customerId => updateValues({ customerId })}
        />
      </Box>
      <Box sx={styles.grid({ minColumnWidth: 500 })}>
        <ApartmentTeamDraftCard
          building={building}
          members={values.members}
          engineerUserId={values.engineerUserId}
          onChange={members => updateValues({ members })}
          onEngineerChange={engineerUserId => updateValues({ engineerUserId })}
        />
        <ApartmentLightingDraftCard
          values={values}
          building={building}
          onChange={updateValues}
          isSubmitAttempted={isSubmitAttempted}
        />
      </Box>
      <ProjectRoleContactsCard
        contacts={roleContacts}
        onChange={changeRoleContact}
        disabled={createMutation.isPending}
        canEditDetails={canEditContactDetails}
      />
      <InheritedPreviewCard building={building} />

      {showFieldErrors && (
        <InlineError message={formatApartmentValidationCount(invalidFieldCount)} />
      )}
      {createMutation.isError && <InlineError message={getApiErrorMessage(createMutation.error)} />}

      <Box sx={styles.endRow}>
        <Button
          text={ADD_APARTMENT_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          disabled={createMutation.isPending}
          onClick={() => navigate(buildProjectPath(building.id))}
        />
        <Button
          icon={ICON_NAMES.ADD}
          onClick={handleSubmit}
          text={ADD_APARTMENT_COPY.SUBMIT}
          isLoading={createMutation.isPending}
        />
      </Box>
    </Box>
  );
};

export default NewApartmentForm;
