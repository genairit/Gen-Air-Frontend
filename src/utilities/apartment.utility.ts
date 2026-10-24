import {
  formatPaymentTerms,
  getPaymentTermsOptions,
  isPaymentTermsNoteRequired,
} from "./project-intake.utility";

import {
  ADD_APARTMENT_COPY,
  BUILDING_PAGE_COPY,
  APARTMENT_PAGE_COPY,
} from "../constants/apartment.constant";

import type {
  IApartmentPosition,
  IApartmentFormValues,
  TInheritanceSourceType,
} from "../interfaces/apartment.interface";

import { isPaymentTerms } from "./guards/api.guard";
import { getFullName } from "./mappers/user.mapper";
import { findOptionIdByLabel } from "./option.utility";
import { validatePaymentTermsNote } from "./validators";
import { formatCustomerDetailValue } from "./customer-details.utility";
import { APARTMENT_UNIT_FIELDS } from "../constants/apartment.constant";
import type { IApartmentPayload } from "../interfaces/api-request.interface";
import type { IApiProjectMember, IApiUser } from "../interfaces/api.interface";
import type { IApiProject, IApiProjectStage } from "../interfaces/api.interface";
import { PROJECT_MEMBER_ROLES, USER_ROLE_LABELS } from "../constants/user-role.constant";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";
import { PAYMENT_TERMS_LABELS, type PaymentTermsType } from "../constants/payment-terms.constant";

export type ProjectKindType = "building" | "apartment" | "standalone";

const APARTMENT_FORM_FIELDS = APARTMENT_UNIT_FIELDS;

export const getProjectKind = (project: IApiProject): ProjectKindType => {
  if (project.parentProjectId) {
    return "apartment";
  }

  if (project.projectType?.canHaveApartments) {
    return "building";
  }

  return "standalone";
};

export const formatApartmentCount = (count: number) => {
  if (count === 0) {
    return "ללא דירות";
  }

  return `${count} דירות`;
};

export const formatApartmentNumber = (apartment: IApiProject) =>
  `דירה ${apartment.customerApartment ?? ""}`;

export const formatFloor = (apartment: IApiProject) => `קומה ${apartment.customerFloor ?? ""}`;

export const formatApartmentHeading = (apartment: IApiProject) =>
  `${formatApartmentNumber(apartment)} · ${formatFloor(apartment)}`;

export const formatEndCustomer = (apartment: IApiProject) =>
  apartment.customerName ?? BUILDING_PAGE_COPY.NO_END_CUSTOMER;

export const formatVisibleApartments = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} דירות`;

export const formatApartmentPosition = (position: IApartmentPosition, buildingName: string) =>
  `דירה ${position.position} מתוך ${position.total} בבניין ${buildingName}`;

export const toOptionalText = (value: string) => value.trim() || null;

export const toApartmentPayload = (values: IApartmentFormValues): IApartmentPayload => ({
  customerId: values.customerId ?? "",
  customerFloor: Number(values.floor),
  customerApartment: values.apartmentNumber.trim(),
  ...(values.members === null ? {} : { members: toApartmentAssignments(values.members) }),
  ...(values.paymentTerms
    ? toPaymentTermsOverride(values.paymentTerms, values.paymentTermsNote)
    : {}),
});

export const countInvalidApartmentFields = (values: IApartmentFormValues) => {
  const unitErrors = APARTMENT_FORM_FIELDS.filter(
    config => !config.validate(values[config.field]).isValid,
  ).length;
  const customerErrors = Number(!values.customerId);
  const noteRequired = isPaymentTermsNoteRequired(values.paymentTerms);
  const noteErrors = Number(
    noteRequired && !validatePaymentTermsNote(values.paymentTermsNote).isValid,
  );
  return unitErrors + customerErrors + noteErrors;
};

export const toApartmentAssignments = (members: IApiProjectMember[]) =>
  members.map(({ userId, role }) => ({ userId, role }));

export const getApartmentTeamCandidates = (users: IApiUser[], members: IApiProjectMember[]) =>
  users.filter(user => {
    const isActive = !user.deletedAt;
    const hasEligibleRole = PROJECT_MEMBER_ROLES.some(role => role === user.role);
    const isRoleAvailable = !members.some(member => member.role === user.role);
    return isActive && hasEligibleRole && isRoleAvailable;
  });

export const toApartmentTeamOptions = (users: IApiUser[]) =>
  users.map(user => ({
    user,
    label: `${getFullName(user)} · ${USER_ROLE_LABELS[user.role]} (${user.employeeNumber})`,
  }));

export const formatParentCustomerNote = (building: IApiProject) =>
  `לקוח הפרויקט האב: ${building.customer?.name ?? building.customerName ?? "לא שויך לקוח"}. הוא אינו לקוח הקצה של הדירה ואינו עובר אליה.`;

export const formatApartmentValidationCount = (count: number) =>
  `יש ${count} שדות לתיקון לפני ההוספה`;

export const getPaymentTermsSource = (apartment: IApiProject): TInheritanceSourceType => {
  const isInherited = apartment.inheritedFields?.includes("paymentTerms") ?? false;

  if (isInherited) {
    return "building";
  }

  return "overridden";
};

export const findApartmentPosition = (
  apartments: IApiProject[],
  apartmentId: string,
): IApartmentPosition => {
  const index = apartments.findIndex(apartment => apartment.id === apartmentId);
  const isListed = index >= 0;

  if (!isListed) {
    return { position: 0, total: apartments.length, nextId: null, previousId: null };
  }

  return {
    position: index + 1,
    total: apartments.length,
    nextId: apartments[index + 1]?.id ?? null,
    previousId: apartments[index - 1]?.id ?? null,
  };
};

const TAMA_NOTE_PATTERN = /תמ[״"]א/;

export const hasTamaNote = (notes?: string | null) => TAMA_NOTE_PATTERN.test(notes ?? "");

export const formatBuildingBadge = (apartmentCount: number) =>
  `בניין · ${formatApartmentCount(apartmentCount)}`;

export const formatApartmentResults = (count: number) => `${count} תוצאות`;

export const findStage = (stages: IApiProjectStage[], stageId: string) =>
  stages.find(stage => stage.id === stageId) ?? null;

export const formatSelectedApartments = (count: number) =>
  `${count} ${BUILDING_PAGE_COPY.SELECTED}`;

export const formatInheritedNotesSummary = (notes: string | null) => {
  if (hasTamaNote(notes)) {
    return ADD_APARTMENT_COPY.HAS_NOTES;
  }

  return notes ?? ADD_APARTMENT_COPY.NO_NOTES;
};

export const formatBuildingEyebrow = (buildingName: string) =>
  `${APARTMENT_PAGE_COPY.BUILDING_PREFIX} ${buildingName}`;

export const toStageTabs = (stages: IApiProjectStage[]) =>
  stages.map(stage => ({ id: stage.id, label: stage.name }));

export const toPaymentTermsOptions = (fieldSet: ProjectDetailFieldSetType | null) =>
  getPaymentTermsOptions(fieldSet).map(terms => ({
    id: terms,
    label: PAYMENT_TERMS_LABELS[terms].title,
  }));

export const findPaymentTermsByLabel = (
  fieldSet: ProjectDetailFieldSetType | null,
  label: string | null,
) => {
  const terms = findOptionIdByLabel(toPaymentTermsOptions(fieldSet), label);

  if (!isPaymentTerms(terms)) {
    return null;
  }

  return terms;
};

export const toPaymentTermsOverride = (terms: PaymentTermsType, note: string) => ({
  paymentTerms: terms,
  paymentTermsNote: isPaymentTermsNoteRequired(terms) ? note.trim() : null,
});

const formatParentPaymentTerms = (building: IApiProject) =>
  `${APARTMENT_PAGE_COPY.PARENT_VALUE_PREFIX} ${formatCustomerDetailValue(formatPaymentTerms(building.paymentTerms))}`;

export const getPaymentTermsNotes = ({
  source,
  building,
}: {
  building: IApiProject;
  source: TInheritanceSourceType;
}) => {
  if (source === "overridden") {
    return [APARTMENT_PAGE_COPY.OVERRIDE_NOTE, formatParentPaymentTerms(building)];
  }

  return [APARTMENT_PAGE_COPY.FOLLOWS_UPDATES];
};

export const formatApartmentUnit = (apartment: IApiProject) =>
  `${formatFloor(apartment)} · ${formatApartmentNumber(apartment)}`;
