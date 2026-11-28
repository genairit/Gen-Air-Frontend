import {
  formatBuildingEyebrow,
  countInvalidApartmentFields,
} from "../../../utilities/apartment.utility";

import {
  ADD_APARTMENT_COPY,
  EMPTY_APARTMENT_FORM,
  APARTMENT_UNIT_FIELDS,
} from "../../../constants/apartment.constant";

import {
  setProjectRoleContact,
  emptyProjectRoleContacts,
  projectRoleContactInputs,
} from "../../../utilities/project-contact-role.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import {
  getProjectMutationError,
  isExistingDriveFolderError,
} from "../../../utilities/existing-drive-folder-error.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import ApartmentFieldsCard from "./ApartmentFieldsCard";
import InheritedPreviewCard from "./InheritedPreviewCard";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionUser } from "../../../store/session.store";
import ApartmentTeamDraftCard from "./ApartmentTeamDraftCard";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import { hasPermission } from "../../../utilities/permission.utility";
import ApartmentLightingDraftCard from "./ApartmentLightingDraftCard";
import InlineError from "../../../components/InlineError/InlineError";
import { useCustomerQuery } from "../../../hooks/queries/customer.query";
import { isCustomerSelectable } from "../../../utilities/customer.utility";
import { useProjectFormTabs } from "../../../hooks/project-form-tabs.hook";
import { getApartmentBuildingPath } from "../../../utilities/route.utility";
import { PROJECT_TABS } from "../../../constants/project-workspace.constant";
import { useExistingDriveFolder } from "../../../hooks/existing-drive-folder.hook";
import type { IApartmentFormValues } from "../../../interfaces/apartment.interface";
import ProjectWorkspace from "../../../components/ProjectWorkspace/ProjectWorkspace";
import { formatApartmentValidationCount } from "../../../utilities/apartment.utility";
import type { ICustomerContact } from "../../../interfaces/customer-contact.interface";
import { getLightingHeightError } from "../../../utilities/project-constraints.utility";
import { useCreateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
import type { ProjectContactRoleType } from "../../../constants/project-contact-role.constant";
import ProjectCustomerPickerCard from "../../project-form/components/ProjectCustomerPickerCard";
import ProjectRoleContactsCard from "../../../components/ProjectContactRoles/ProjectRoleContactsCard";
import ExistingDriveFolderField from "../../../components/ExistingDriveFolderField/ExistingDriveFolderField";

interface INewApartmentFormProps {
  building: IApiProject;
}

const NewApartmentForm: FC<INewApartmentFormProps> = ({ building }) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const parentPath = getApartmentBuildingPath(building.id, location.state?.buildingSearch);
  const { activeTab, setActiveTab, focusError } = useProjectFormTabs();
  const sessionUser = useSessionUser();
  const [roleActivity, setRoleActivity] = useState<
    Partial<Record<ProjectContactRoleType, boolean>>
  >({});
  const [roleContacts, setRoleContacts] = useState(emptyProjectRoleContacts);
  const [values, setValues] = useState<IApartmentFormValues>(EMPTY_APARTMENT_FORM);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const driveFolder = useExistingDriveFolder(building.id);
  const createMutation = useCreateApartmentMutation();
  const customerQuery = useCustomerQuery(values.customerId);

  const isCustomerReady = isCustomerSelectable(customerQuery.data);
  const invalidSelectedCustomerCount = Number(Boolean(values.customerId) && !isCustomerReady);
  const invalidFieldCount = countInvalidApartmentFields(values) + invalidSelectedCustomerCount;
  const showFieldErrors = isSubmitAttempted && invalidFieldCount > 0;

  const hasUnfinishedRoleContact = Object.values(roleActivity).some(active => active);

  const changeRoleActivity = (role: ProjectContactRoleType, active: boolean) =>
    setRoleActivity(current => ({ ...current, [role]: active }));

  const canCreateContact = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const canEditContactDetails = hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_UPDATE);
  const changeRoleContact = (role: ProjectContactRoleType, contact: ICustomerContact | null) => {
    const next = setProjectRoleContact(roleContacts, role, contact);
    setRoleContacts(next);
  };

  const updateValues = (changes: Partial<IApartmentFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleSubmit = () => {
    setIsSubmitAttempted(true);

    const invalidUnit = APARTMENT_UNIT_FIELDS.find(
      field => !field.validate(values[field.field]).isValid,
    );
    if (invalidUnit) {
      focusError(PROJECT_TABS.details.id, `#apartment-${invalidUnit.field}`);
      return;
    }
    if (!driveFolder.canSubmit) {
      focusError(PROJECT_TABS.details.id, '[data-apartment-folder] input:not([type="radio"])');
      return;
    }
    if (!isCustomerReady) {
      focusError(
        PROJECT_TABS.details.id,
        "[data-apartment-customer] :is(input,button:not(:disabled))",
      );
      return;
    }
    if (values.hasOwnLighting && getLightingHeightError(values)) {
      focusError(PROJECT_TABS.technical.id, 'input:not([type="checkbox"]):not([type="radio"])');
      return;
    }
    if (hasUnfinishedRoleContact) {
      focusError(PROJECT_TABS.people.id);
      return;
    }
    if (createMutation.isPending) return;

    createMutation.mutate(
      {
        buildingId: building.id,
        values,
        contacts: projectRoleContactInputs(roleContacts),
        existingDriveFolder: driveFolder.existingDriveFolder,
      },
      {
        onSuccess: () => navigate(parentPath),
        onError: error => {
          if (isExistingDriveFolderError(error)) {
            focusError(
              PROJECT_TABS.details.id,
              '[data-apartment-folder] input:not([type="radio"])',
            );
          }
        },
      },
    );
  };

  const panels = [
    {
      ...PROJECT_TABS.details,
      content: (
        <Box sx={styles.grid({ minColumnWidth: 500 })}>
          <ApartmentFieldsCard
            values={values}
            minColumnWidth={240}
            icon={ICON_NAMES.HOME}
            onChange={updateValues}
            fields={APARTMENT_UNIT_FIELDS}
            title={ADD_APARTMENT_COPY.UNIT_TITLE}
            isSubmitAttempted={isSubmitAttempted}
          >
            <Box data-apartment-folder>
              <ExistingDriveFolderField
                isApartment
                state={driveFolder}
                disabled={createMutation.isPending}
              />
            </Box>
          </ApartmentFieldsCard>
          <Box data-apartment-customer>
            <ProjectCustomerPickerCard
              isApartment
              customerId={values.customerId}
              isSubmitAttempted={isSubmitAttempted}
              title={ADD_APARTMENT_COPY.PEOPLE_TITLE}
              subtitle={ADD_APARTMENT_COPY.PEOPLE_SUBTITLE}
              onChange={customerId => updateValues({ customerId })}
            />
          </Box>
        </Box>
      ),
    },
    {
      ...PROJECT_TABS.technical,
      content: (
        <>
          <ApartmentLightingDraftCard
            values={values}
            building={building}
            onChange={updateValues}
            isSubmitAttempted={isSubmitAttempted}
          />
          <InheritedPreviewCard building={building} />
        </>
      ),
    },
    {
      ...PROJECT_TABS.people,
      content: (
        <>
          <ProjectRoleContactsCard
            contacts={roleContacts}
            onChange={changeRoleContact}
            disabled={createMutation.isPending}
            canCreateContact={canCreateContact}
            onActivityChange={changeRoleActivity}
            canEditDetails={canEditContactDetails}
          />
          {isSubmitAttempted && hasUnfinishedRoleContact && (
            <InlineError message="יש לסיים את עריכת איש הקשר לפני יצירת הדירה" />
          )}
          <ApartmentTeamDraftCard
            building={building}
            members={values.members}
            engineerUserId={values.engineerUserId}
            onChange={members => updateValues({ members })}
            onEngineerChange={engineerUserId => updateValues({ engineerUserId })}
          />
        </>
      ),
    },
  ];
  const header = (
    <Box sx={styles.headerText}>
      <Box component="h1" sx={styles.heading}>
        {ADD_APARTMENT_COPY.TITLE}
      </Box>
      <Box sx={styles.caption}>{formatBuildingEyebrow(building.name)}</Box>
    </Box>
  );
  const footer = (
    <>
      {showFieldErrors && (
        <InlineError message={formatApartmentValidationCount(invalidFieldCount)} />
      )}
      {createMutation.isError && (
        <InlineError message={getProjectMutationError(createMutation.error)} />
      )}

      <Box sx={styles.endRow}>
        <Button
          size={BUTTON_SIZES.COMPACT}
          text={ADD_APARTMENT_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          disabled={createMutation.isPending}
          onClick={() => navigate(parentPath)}
        />
        <Button
          icon={ICON_NAMES.ADD}
          onClick={handleSubmit}
          size={BUTTON_SIZES.COMPACT}
          text={ADD_APARTMENT_COPY.SUBMIT}
          disabled={createMutation.isPending}
          isLoading={createMutation.isPending}
        />
      </Box>
    </>
  );
  return (
    <ProjectWorkspace
      keepMounted
      panels={panels}
      header={header}
      footer={footer}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      defaultTab={PROJECT_TABS.details.id}
    />
  );
};

export default NewApartmentForm;
