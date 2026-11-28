import {
  toProjectFormValues,
  countMissingCustomer,
  canSubmitProjectForm,
} from "../../../utilities/project.utility";

import type {
  ITypeSwitch,
  IVerifiedAddress,
  IProjectFormValues,
} from "../../../interfaces/project.interface";

import {
  ALL_USERS_QUERY,
  PROJECT_FORM_COPY,
  PROJECT_FORM_MODES,
  PROJECT_FORM_MODE_COPY,
  type ProjectFormModeType,
} from "../../../constants/project-form.constant";

import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "../../../hooks/mutations/project.mutation";

import {
  isCityRequired,
  toIntakeValues,
  countIntakeErrors,
  getRequiredIntakeGroups,
} from "../../../utilities/project-intake.utility";

import {
  buildTypeSwitch,
  findDetailFieldSet,
  getSiteDetailFields,
  validateCustomerDetail,
} from "../../../utilities/customer-details.utility";

import {
  getProjectNameError,
  isProjectNameConflict,
  getLightingHeightError,
} from "../../../utilities/project-constraints.utility";

import {
  setProjectRoleContact,
  emptyProjectRoleContacts,
  projectContactCreationInputs,
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
import { useNavigate } from "react-router-dom";
import ProjectTypeCard from "./ProjectTypeCard";
import { usePageStyles } from "../../page.style";
import Chip from "../../../components/Chip/Chip";
import ProjectRolesCard from "./ProjectRolesCard";
import ProjectNotesCard from "./ProjectNotesCard";
import TypeSwitchBanner from "./TypeSwitchBanner";
import ProjectAddressCard from "./ProjectAddressCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import Button from "../../../components/Button/Button";
import ProjectLightingFields from "./ProjectLightingFields";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import ProjectSiteDetailsCard from "./ProjectSiteDetailsCard";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { useProjectDraft } from "../../../hooks/project-draft.hook";
import ProjectCustomerPickerCard from "./ProjectCustomerPickerCard";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import { useProjectFormTabs } from "../../../hooks/project-form-tabs.hook";
import { PROJECT_TABS } from "../../../constants/project-workspace.constant";
import { countStageNoteErrors } from "../../../utilities/stage-reason.utility";
import { toProjectTypeOption } from "../../../utilities/mappers/project.mapper";
import { STAGE_REASON_FIELD_ID } from "../../../constants/project-stage.constant";
import ProjectContacts from "../../../components/ProjectContacts/ProjectContacts";
import { useExistingDriveFolder } from "../../../hooks/existing-drive-folder.hook";
import type { ProjectMemberRoleType } from "../../../constants/user-role.constant";
import ProjectWorkspace from "../../../components/ProjectWorkspace/ProjectWorkspace";
import { useProjectNameAvailability } from "../../../hooks/queries/project-name.query";
import type { ICustomerContact } from "../../../interfaces/customer-contact.interface";
import { PROJECT_CONTACT_ROLE_COPY } from "../../../constants/project-contact-role.constant";
import type { IApiProject, CustomerDetailFieldType } from "../../../interfaces/api.interface";
import { buildProjectPath, getProjectFormCancelPath } from "../../../utilities/route.utility";
import type { ProjectContactRoleType } from "../../../constants/project-contact-role.constant";
import { readProjectDraft, clearProjectDraft } from "../../../utilities/project-draft.utility";
import { useProjectStagesQuery, useProjectTypesQuery } from "../../../hooks/queries/project.query";
import ProjectRoleContactsCard from "../../../components/ProjectContactRoles/ProjectRoleContactsCard";
import DirectoryContactPicker from "../../../components/DirectoryContactPicker/DirectoryContactPicker";
import ExistingDriveFolderField from "../../../components/ExistingDriveFolderField/ExistingDriveFolderField";

interface IProjectFormProps {
  mode: ProjectFormModeType;
  project: IApiProject | null;
}

const ProjectForm: FC<IProjectFormProps> = ({ mode, project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const { activeTab, setActiveTab, focusError } = useProjectFormTabs();
  const sessionUser = useSessionUser();
  const copy = PROJECT_FORM_MODE_COPY[mode];
  const projectId = project?.id ?? null;
  const isEditMode = mode === PROJECT_FORM_MODES.EDIT;
  const draftUserId = !isEditMode ? (sessionUser?.id ?? null) : null;
  const [restoredDraft] = useState(() => readProjectDraft(draftUserId));
  const [wasDraftRestored, setWasDraftRestored] = useState(Boolean(restoredDraft));
  const [values, setValues] = useState<IProjectFormValues>(
    () => restoredDraft ?? toProjectFormValues(project),
  );
  const discardDraft = () => {
    clearProjectDraft(draftUserId);
    setValues(toProjectFormValues(null));
    setWasDraftRestored(false);
    setTypeSwitch(null);
    setIsSubmitAttempted(false);
    setRoleContacts(emptyProjectRoleContacts());
    setRoleActivity({});
    setSelectedContacts([]);
    driveFolder.reset();
    setActiveTab(PROJECT_TABS.details.id);
  };
  const [typeSwitch, setTypeSwitch] = useState<ITypeSwitch | null>(null);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [roleActivity, setRoleActivity] = useState<
    Partial<Record<ProjectContactRoleType, boolean>>
  >({});
  const [roleContacts, setRoleContacts] = useState(emptyProjectRoleContacts);
  const [selectedContacts, setSelectedContacts] = useState<ICustomerContact[]>([]);

  const driveFolder = useExistingDriveFolder(null);

  useProjectDraft(draftUserId, values);

  const usersQuery = useUsersQuery(ALL_USERS_QUERY);
  const typesQuery = useProjectTypesQuery();
  const stagesQuery = useProjectStagesQuery();
  const createMutation = useCreateProjectMutation(draftUserId);
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();
  const nameAvailability = useProjectNameAvailability(values.name, projectId);

  const projectTypes = typesQuery.data ?? [];
  const fieldSet = findDetailFieldSet(projectTypes, values.typeId);
  const selectedTypeName = projectTypes.find(type => type.id === values.typeId)?.name ?? "";
  const canHaveApartments =
    projectTypes.find(type => type.id === values.typeId)?.canHaveApartments ??
    (values.typeId === project?.projectTypeId ? project.projectType?.canHaveApartments : false) ??
    false;
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canDelete = isEditMode && hasPermission(sessionUser, PERMISSIONS.PROJECTS_DELETE);
  const originalIntake = project ? toIntakeValues(project) : null;
  const originalStageId = project?.stageId ?? null;
  const stageNoteErrorCount = countStageNoteErrors({
    originalStageId,
    stageId: values.stageId,
    stageNote: values.stageNote,
  });
  const requiredIntake = getRequiredIntakeGroups(values, originalIntake);
  const intakeErrorCount = countIntakeErrors({ values, fieldSet, original: originalIntake });
  const hasSiteDetails = getSiteDetailFields(fieldSet).length > 0;
  const heightError = getLightingHeightError(values);
  const mutationName =
    (createMutation.variables ?? updateMutation.variables)?.values.name.trim() ?? null;
  const hasServerNameConflict =
    isProjectNameConflict(mutationError) && mutationName === values.name.trim();
  const isNameTaken = nameAvailability.isTaken || hasServerNameConflict;
  const nameError = getProjectNameError({
    isTaken: isNameTaken,
    isCheckFailed: nameAvailability.isError,
  });
  const hasUnfinishedRoleContact = Object.values(roleActivity).some(active => active);
  const invalidSiteFields = getSiteDetailFields(fieldSet).filter(
    config => !validateCustomerDetail(config, values.customerDetails[config.field]).isValid,
  );
  const blockingFields = [
    {
      invalid: !values.name.trim() || isNameTaken || nameAvailability.isError,
      tab: PROJECT_TABS.details.id,
      selector: "#project-form-name",
    },
    {
      invalid: stageNoteErrorCount > 0,
      tab: PROJECT_TABS.details.id,
      selector: `#${STAGE_REASON_FIELD_ID}`,
    },
    {
      invalid: !values.typeId,
      tab: PROJECT_TABS.details.id,
      selector: '[data-project-field="type"] input',
    },
    {
      invalid: intakeErrorCount > 0,
      tab: PROJECT_TABS.details.id,
      selector: '[data-project-field="address"] :is(input,button)',
    },
    {
      invalid: countMissingCustomer(values) > 0,
      tab: PROJECT_TABS.details.id,
      selector: '[data-project-field="customer"] input',
    },
    {
      invalid: !isEditMode && !driveFolder.canSubmit,
      tab: PROJECT_TABS.details.id,
      selector: '[data-project-field="drive"] input:not([type=radio])',
    },
    ...invalidSiteFields.map(({ field }) => ({
      invalid: true,
      tab: PROJECT_TABS.technical.id,
      selector: `#project-site-${field}`,
    })),
    {
      invalid: Boolean(heightError),
      tab: PROJECT_TABS.technical.id,
      selector: '[data-project-field="lighting"] input:not([type=checkbox])',
    },
    {
      invalid: hasUnfinishedRoleContact,
      tab: PROJECT_TABS.people.id,
      selector: '[data-project-field="contacts"] input:not([role=combobox]):not([disabled])',
    },
  ].filter(field => field.invalid);
  const firstError = blockingFields[0];
  const formErrorCount = blockingFields.length;
  const isSubmitDisabled =
    isSaving ||
    nameAvailability.isPending ||
    (activeTab === PROJECT_TABS.details.id &&
      (!canSubmitProjectForm(values) ||
        isNameTaken ||
        nameAvailability.isError ||
        (!isEditMode && !driveFolder.canSubmit))) ||
    (activeTab === PROJECT_TABS.people.id && hasUnfinishedRoleContact);
  const onSubmitError = (error: unknown) => {
    if (isProjectNameConflict(error)) focusError(PROJECT_TABS.details.id, "#project-form-name");
    if (isExistingDriveFolderError(error))
      focusError(PROJECT_TABS.details.id, '[data-project-field="drive"] input:not([type=radio])');
  };
  const openProject = (savedProjectId: string) => navigate(buildProjectPath(savedProjectId));

  const submitByMode: Record<ProjectFormModeType, () => void> = {
    new: () =>
      createMutation.mutate(
        {
          values,
          fieldSet,
          originalIntake,
          canHaveApartments,
          contacts: projectContactCreationInputs(roleContacts, selectedContacts),
          existingDriveFolder: driveFolder.existingDriveFolder,
        },
        { onSuccess: openProject, onError: onSubmitError },
      ),
    edit: () =>
      updateMutation.mutate(
        {
          projectId: projectId ?? "",
          values,
          fieldSet,
          originalIntake,
          canHaveApartments,
          originalStageId,
        },
        { onSuccess: openProject, onError: onSubmitError },
      ),
  };

  const changeRoleActivity = (role: ProjectContactRoleType, active: boolean) =>
    setRoleActivity(current => ({ ...current, [role]: active }));

  const changeRoleContact = (role: ProjectContactRoleType, contact: ICustomerContact | null) => {
    const next = setProjectRoleContact(roleContacts, role, contact);
    setRoleContacts(next);
  };

  const canCreateContact = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const canEditContactDetails = hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_UPDATE);

  const handleRetryNameCheck = async () => {
    await nameAvailability.retry();
  };

  const handleSubmit = () => {
    if (firstError) {
      setIsSubmitAttempted(true);
      focusError(firstError.tab, firstError.selector);
      return;
    }
    if (isSubmitDisabled) return;

    submitByMode[mode]();
  };

  const updateValues = (changes: Partial<IProjectFormValues>) => {
    const isNameChanging = "name" in changes && changes.name !== values.name;
    if (isNameChanging && hasServerNameConflict) {
      createMutation.reset();
      updateMutation.reset();
    }

    setValues(current => ({ ...current, ...changes }));
  };

  const handleCustomerDetailChange = (field: CustomerDetailFieldType, value: string) =>
    setValues(current => ({
      ...current,
      customerDetails: { ...current.customerDetails, [field]: value },
    }));

  const handleAddressChange = (address: IVerifiedAddress | null) => updateValues({ address });

  const handleCustomerChange = (customerId: string | null) => updateValues({ customerId });

  const handleTypeSelect = (typeId: string) => {
    setTypeSwitch(
      buildTypeSwitch({
        toTypeId: typeId,
        types: projectTypes,
        fromTypeId: values.typeId,
        values: values.customerDetails,
      }),
    );
    updateValues({ typeId });
  };

  const handleUndoTypeSwitch = () => {
    updateValues({ typeId: typeSwitch?.fromTypeId ?? values.typeId });
    setTypeSwitch(null);
  };

  const handleAssigneeChange = (role: ProjectMemberRoleType, userId: string | null) =>
    setValues(current => ({ ...current, assignees: { ...current.assignees, [role]: userId } }));

  const handleDelete = () => {
    if (!projectId) {
      return;
    }

    deleteMutation.mutate(projectId, { onSuccess: () => navigate(ROUTE_PATHS.BOARD) });
  };

  const showAddressError = isSubmitAttempted && requiredIntake.address;
  const siteDetailsCard = fieldSet && hasSiteDetails && (
    <ProjectSiteDetailsCard
      fieldSet={fieldSet}
      typeName={selectedTypeName}
      values={values.customerDetails}
      isSubmitAttempted={isSubmitAttempted}
      onChange={handleCustomerDetailChange}
    />
  );
  const driveFolderField = !isEditMode ? (
    <ExistingDriveFolderField state={driveFolder} disabled={isSaving} />
  ) : null;
  const contactPicker = !isEditMode && (
    <ProjectRoleContactsCard
      disabled={isSaving}
      contacts={roleContacts}
      onChange={changeRoleContact}
      canCreateContact={canCreateContact}
      onActivityChange={changeRoleActivity}
      canEditDetails={canEditContactDetails}
    >
      <DirectoryContactPicker
        embedded
        multiple
        disabled={isSaving}
        title="אנשי קשר נוספים"
        selected={selectedContacts}
        onChange={setSelectedContacts}
        subtitle="חפש ובחר אנשי קשר נוספים. הראשון שנבחר יהיה איש הקשר הראשי."
      />
    </ProjectRoleContactsCard>
  );

  const header = (
    <Box sx={styles.spacedRow}>
      <Box sx={styles.row({ gap: "8px" })}>
        <Box component="h1" sx={styles.heading}>
          {copy.title}
        </Box>
        {project && <Chip isMonospace label={project.code} size={CHIP_SIZES.MEDIUM} />}
      </Box>
      {!isEditMode && (
        <Box component="details">
          <Box component="summary" sx={{ cursor: "pointer", fontWeight: 600 }}>
            {wasDraftRestored ? PROJECT_FORM_COPY.DRAFT_RESTORED : "טיוטה מקומית"}
          </Box>
          <Box sx={styles.stack({ gap: "8px" })}>
            <Box sx={styles.caption}>{PROJECT_FORM_COPY.DRAFT_PRIVACY}</Box>
            <Button
              onClick={discardDraft}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={PROJECT_FORM_COPY.DISCARD_DRAFT}
              disabled={hasUnfinishedRoleContact || isSaving}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
  const details = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={styles.grid({ minColumnWidth: 280, gap: "16px" })}>
        <ProjectDetailsCard
          mode={mode}
          values={values}
          nameError={nameError}
          onChange={updateValues}
          stages={stagesQuery.data ?? []}
          originalStageId={originalStageId}
          isSubmitAttempted={isSubmitAttempted}
          onRetryNameCheck={handleRetryNameCheck}
          namePending={nameAvailability.isPending}
          nameCheckFailed={nameAvailability.isError}
        />
        <Box data-project-field="type">
          <ProjectTypeCard
            onSelect={handleTypeSelect}
            selectedTypeId={values.typeId}
            options={projectTypes.map(toProjectTypeOption)}
          />
          {isSubmitAttempted && !values.typeId && <InlineError message="יש לבחור סוג פרויקט" />}
        </Box>
      </Box>
      {typeSwitch && (
        <TypeSwitchBanner
          typeName={selectedTypeName}
          summary={typeSwitch.summary}
          onUndo={handleUndoTypeSwitch}
          onDismiss={() => setTypeSwitch(null)}
        />
      )}
      <Box sx={styles.grid({ minColumnWidth: 300, gap: "16px" })}>
        <Box data-project-field="address">
          <ProjectAddressCard
            address={values.address}
            onChange={handleAddressChange}
            showMissingError={showAddressError}
            requiresCity={isCityRequired(fieldSet)}
          />
        </Box>
        <Box data-project-field="customer">
          <ProjectCustomerPickerCard
            customerId={values.customerId}
            onChange={handleCustomerChange}
            isSubmitAttempted={isSubmitAttempted}
          />
        </Box>
      </Box>
      {driveFolderField && <Box data-project-field="drive">{driveFolderField}</Box>}
    </Box>
  );
  const technical = (
    <Box sx={styles.stack({ gap: "16px" })}>
      {siteDetailsCard}
      <Box data-project-field="lighting">
        <ProjectLightingFields
          values={values}
          onChange={updateValues}
          isSubmitAttempted={isSubmitAttempted}
        />
      </Box>
      {canHaveApartments && (
        <ProjectNotesCard notes={values.notes} onChange={notes => updateValues({ notes })} />
      )}
    </Box>
  );
  const people = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box data-project-field="contacts">
        {contactPicker}
        {isEditMode && projectId && (
          <>
            <Box sx={styles.caption}>{PROJECT_CONTACT_ROLE_COPY.INSTANT_SAVE}</Box>
            <ProjectContacts canEdit projectId={projectId} />
          </>
        )}
      </Box>
      <ProjectRolesCard
        assignees={values.assignees}
        users={usersQuery.data ?? []}
        isBuilding={canHaveApartments}
        onAssigneeChange={handleAssigneeChange}
      />
    </Box>
  );
  const footer = (
    <Box sx={styles.stack({ gap: "8px" })}>
      {isSubmitAttempted && formErrorCount > 0 && (
        <InlineError message={formatFieldErrorCount(formErrorCount)} />
      )}
      {mutationError && <InlineError message={getProjectMutationError(mutationError)} />}
      <Box sx={styles.spacedRow}>
        <Box>
          {canDelete && (
            <Button
              onClick={handleDelete}
              icon={ICON_NAMES.DELETE}
              size={BUTTON_SIZES.COMPACT}
              text={PROJECT_FORM_COPY.DELETE}
              variant={BUTTON_VARIANTS.DANGER}
              isLoading={deleteMutation.isPending}
            />
          )}
        </Box>
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            size={BUTTON_SIZES.COMPACT}
            text={PROJECT_FORM_COPY.CANCEL}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => navigate(getProjectFormCancelPath(projectId))}
          />
          <Button
            isLoading={isSaving}
            icon={copy.submitIcon}
            onClick={handleSubmit}
            text={copy.submitLabel}
            size={BUTTON_SIZES.COMPACT}
            disabled={isSubmitDisabled}
          />
        </Box>
      </Box>
    </Box>
  );
  return (
    <ProjectWorkspace
      keepMounted
      header={header}
      footer={footer}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      defaultTab={PROJECT_TABS.details.id}
      panels={[
        { ...PROJECT_TABS.details, content: details },
        { ...PROJECT_TABS.technical, content: technical },
        { ...PROJECT_TABS.people, content: people },
      ]}
    />
  );
};

export default ProjectForm;
