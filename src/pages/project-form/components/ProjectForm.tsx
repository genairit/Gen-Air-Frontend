import {
  toProjectFormValues,
  countMissingCustomer,
  canSubmitProjectForm,
} from "../../../utilities/project.utility";

import type {
  ITypeSwitch,
  ContactFieldType,
  IVerifiedAddress,
  IProjectFormValues,
  IPaymentTermsValues,
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
  getPaymentTermsOptions,
  getRequiredIntakeGroups,
  fitPaymentTermsToFieldSet,
} from "../../../utilities/project-intake.utility";

import {
  buildTypeSwitch,
  findDetailFieldSet,
  getSiteDetailFields,
  countCustomerDetailErrors,
} from "../../../utilities/customer-details.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectTypeCard from "./ProjectTypeCard";
import { usePageStyles } from "../../page.style";
import Chip from "../../../components/Chip/Chip";
import ProjectRolesCard from "./ProjectRolesCard";
import TypeSwitchBanner from "./TypeSwitchBanner";
import ProjectDetailsCard from "./ProjectDetailsCard";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import ProjectSiteDetailsCard from "./ProjectSiteDetailsCard";
import ProjectPaymentTermsCard from "./ProjectPaymentTermsCard";
import ActionBar from "../../../components/ActionBar/ActionBar";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { useProjectDraft } from "../../../hooks/project-draft.hook";
import ProjectAddressContactCard from "./ProjectAddressContactCard";
import ProjectCustomerPickerCard from "./ProjectCustomerPickerCard";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toProjectTypeOption } from "../../../utilities/mappers/project.mapper";
import type { ProjectMemberRoleType } from "../../../constants/user-role.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import type { IApiProject, CustomerDetailFieldType } from "../../../interfaces/api.interface";
import { buildProjectPath, getProjectFormCancelPath } from "../../../utilities/route.utility";
import { readProjectDraft, clearProjectDraft } from "../../../utilities/project-draft.utility";
import { useProjectStagesQuery, useProjectTypesQuery } from "../../../hooks/queries/project.query";

interface IProjectFormProps {
  mode: ProjectFormModeType;
  project: IApiProject | null;
}

const ProjectForm: FC<IProjectFormProps> = ({ mode, project }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
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
    setWasPaymentTermsReset(false);
  };
  const [typeSwitch, setTypeSwitch] = useState<ITypeSwitch | null>(null);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [wasPaymentTermsReset, setWasPaymentTermsReset] = useState(false);

  useProjectDraft(draftUserId, values);

  const usersQuery = useUsersQuery(ALL_USERS_QUERY);
  const typesQuery = useProjectTypesQuery();
  const stagesQuery = useProjectStagesQuery();
  const createMutation = useCreateProjectMutation(draftUserId);
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const projectTypes = typesQuery.data ?? [];
  const fieldSet = findDetailFieldSet(projectTypes, values.typeId);
  const selectedTypeName = projectTypes.find(type => type.id === values.typeId)?.name ?? "";
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canDelete = isEditMode && hasPermission(sessionUser, PERMISSIONS.PROJECTS_DELETE);
  const originalIntake = project ? toIntakeValues(project) : null;
  const requiredIntake = getRequiredIntakeGroups(values, originalIntake);
  const intakeErrorCount = countIntakeErrors({ values, fieldSet, original: originalIntake });
  const hasSiteDetails = getSiteDetailFields(fieldSet).length > 0;
  const formErrorCount =
    countMissingCustomer(values) +
    countCustomerDetailErrors(values.customerDetails, fieldSet) +
    intakeErrorCount;

  const openProject = (savedProjectId: string) => navigate(buildProjectPath(savedProjectId));

  const submitByMode: Record<ProjectFormModeType, () => void> = {
    new: () =>
      createMutation.mutate({ values, fieldSet, originalIntake }, { onSuccess: openProject }),
    edit: () =>
      updateMutation.mutate(
        { projectId: projectId ?? "", values, fieldSet, originalIntake },
        { onSuccess: openProject },
      ),
  };

  const handleSubmit = () => {
    if (formErrorCount > 0) {
      setIsSubmitAttempted(true);

      return;
    }

    submitByMode[mode]();
  };

  const updateValues = (changes: Partial<IProjectFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleCustomerDetailChange = (field: CustomerDetailFieldType, value: string) =>
    setValues(current => ({
      ...current,
      customerDetails: { ...current.customerDetails, [field]: value },
    }));

  const handleContactChange = (field: ContactFieldType, value: string) =>
    setValues(current => ({ ...current, contact: { ...current.contact, [field]: value } }));

  const handleAddressChange = (address: IVerifiedAddress | null) => updateValues({ address });

  const handleCustomerChange = (customerId: string | null) => updateValues({ customerId });

  const handlePaymentTermsChange = (paymentTerms: IPaymentTermsValues) => {
    setWasPaymentTermsReset(false);
    updateValues({ paymentTerms });
  };

  const handleTypeSelect = (typeId: string) => {
    const paymentTerms = fitPaymentTermsToFieldSet(
      values.paymentTerms,
      findDetailFieldSet(projectTypes, typeId),
    );

    setWasPaymentTermsReset(paymentTerms.terms !== values.paymentTerms.terms);
    setTypeSwitch(
      buildTypeSwitch({
        toTypeId: typeId,
        types: projectTypes,
        fromTypeId: values.typeId,
        values: values.customerDetails,
      }),
    );
    updateValues({ typeId, paymentTerms });
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

  return (
    <Box sx={styles.page}>
      <Box sx={styles.row({})}>
        <Box component="h1" sx={styles.heading}>
          {copy.title}
        </Box>
        {project && <Chip isMonospace label={project.code} size={CHIP_SIZES.MEDIUM} />}
      </Box>

      {!isEditMode && (
        <NoticeBanner
          lines={[PROJECT_FORM_COPY.DRAFT_PRIVACY]}
          title={
            wasDraftRestored ? PROJECT_FORM_COPY.DRAFT_RESTORED : PROJECT_FORM_COPY.DRAFT_NOTICE
          }
          actions={
            <Button
              text={PROJECT_FORM_COPY.DISCARD_DRAFT}
              onClick={discardDraft}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          }
        />
      )}
      <ProjectDetailsCard
        mode={mode}
        values={values}
        onChange={updateValues}
        stages={stagesQuery.data ?? []}
        projectCode={project?.code ?? null}
      />
      <ProjectTypeCard
        onSelect={handleTypeSelect}
        selectedTypeId={values.typeId}
        options={projectTypes.map(toProjectTypeOption)}
      />
      <ProjectAddressContactCard
        address={values.address}
        contact={values.contact}
        isSubmitAttempted={isSubmitAttempted}
        onAddressChange={handleAddressChange}
        onContactChange={handleContactChange}
        requiresCity={isCityRequired(fieldSet)}
        isAddressRequired={requiredIntake.address}
        isContactRequired={requiredIntake.contact}
      />
      {isSubmitAttempted && formErrorCount > 0 && (
        <InlineError message={formatFieldErrorCount(formErrorCount)} />
      )}
      <ProjectCustomerPickerCard
        customerId={values.customerId}
        onChange={handleCustomerChange}
        isSubmitAttempted={isSubmitAttempted}
      />
      {fieldSet && hasSiteDetails && (
        <ProjectSiteDetailsCard
          fieldSet={fieldSet}
          typeName={selectedTypeName}
          values={values.customerDetails}
          isSubmitAttempted={isSubmitAttempted}
          onChange={handleCustomerDetailChange}
          notice={
            typeSwitch && (
              <TypeSwitchBanner
                typeName={selectedTypeName}
                summary={typeSwitch.summary}
                onUndo={handleUndoTypeSwitch}
                onDismiss={() => setTypeSwitch(null)}
              />
            )
          }
        />
      )}
      {fieldSet && (
        <ProjectPaymentTermsCard
          value={values.paymentTerms}
          wasReset={wasPaymentTermsReset}
          onChange={handlePaymentTermsChange}
          isSubmitAttempted={isSubmitAttempted}
          isRequired={requiredIntake.paymentTerms}
          options={getPaymentTermsOptions(fieldSet)}
        />
      )}
      <ProjectRolesCard
        assignees={values.assignees}
        users={usersQuery.data ?? []}
        onAssigneeChange={handleAssigneeChange}
      />

      {mutationError && <InlineError message={getApiErrorMessage(mutationError)} />}

      <ActionBar captionIcon={ICON_NAMES.INFO} caption={PROJECT_FORM_COPY.NOTICE}>
        {canDelete && (
          <Button
            onClick={handleDelete}
            icon={ICON_NAMES.DELETE}
            text={PROJECT_FORM_COPY.DELETE}
            variant={BUTTON_VARIANTS.DANGER}
            isLoading={deleteMutation.isPending}
          />
        )}
        <Button
          text={PROJECT_FORM_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(getProjectFormCancelPath(projectId))}
        />
        <Button
          isLoading={isSaving}
          icon={copy.submitIcon}
          onClick={handleSubmit}
          text={copy.submitLabel}
          disabled={!canSubmitProjectForm(values)}
        />
      </ActionBar>
    </Box>
  );
};

export default ProjectForm;
