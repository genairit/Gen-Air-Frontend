import {
  ADD_APARTMENT_COPY,
  BUILDING_PAGE_COPY,
  APARTMENT_PAGE_COPY,
} from "../constants/apartment.constant";

import type {
  IApartmentPosition,
  IApartmentFormValues,
  IApartmentTeamCandidate,
} from "../interfaces/apartment.interface";

import { getFullName } from "./mappers/user.mapper";
import { getAssignedRoles } from "./user-role.utility";
import { APARTMENT_UNIT_FIELDS } from "../constants/apartment.constant";
import { APARTMENT_LIGHTING_COPY } from "../constants/apartment.constant";
import type { IApartmentPayload } from "../interfaces/api-request.interface";
import type { IApiProjectMember, IApiUser } from "../interfaces/api.interface";
import type { IApiProject, IApiProjectStage } from "../interfaces/api.interface";
import type { IProjectLightingFormValues } from "../interfaces/project.interface";
import { PROJECT_CONSTRAINT_COPY } from "../constants/project-constraints.constant";
import { USER_ROLE_LABELS, PROJECT_MEMBER_ROLES } from "../constants/user-role.constant";
import { getLightingHeightError, toLightingPayload } from "./project-constraints.utility";

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
  apartment.customer?.name ?? apartment.customerName ?? BUILDING_PAGE_COPY.NO_END_CUSTOMER;

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
  ...(values.hasOwnLighting ? { hasOwnLighting: true, ...toLightingPayload(values) } : {}),
});

export const toApartmentLightingValues = (project: IApiProject): IProjectLightingFormValues => ({
  hasGeneralLightingCeilingLowering: project.hasGeneralLightingCeilingLowering ?? false,
  generalLightingCeilingLoweringHeight:
    project.generalLightingCeilingLoweringHeight?.toString() ?? "",
});

export const formatApartmentLighting = (values: IProjectLightingFormValues): string =>
  values.hasGeneralLightingCeilingLowering
    ? `${values.generalLightingCeilingLoweringHeight} ${PROJECT_CONSTRAINT_COPY.HEIGHT_UNIT}`
    : APARTMENT_LIGHTING_COPY.DISABLED;

export const countInvalidApartmentFields = (values: IApartmentFormValues) => {
  const unitErrors = APARTMENT_FORM_FIELDS.filter(
    config => !config.validate(values[config.field]).isValid,
  ).length;
  const customerErrors = Number(!values.customerId);
  const lightingErrors = Number(values.hasOwnLighting && Boolean(getLightingHeightError(values)));
  return unitErrors + customerErrors + lightingErrors;
};

export const toApartmentAssignments = (members: IApiProjectMember[]) =>
  members.map(({ userId, role }) => ({ userId, role }));

export const getApartmentTeamCandidates = (
  users: IApiUser[],
  members: IApiProjectMember[],
): IApartmentTeamCandidate[] =>
  users.flatMap(user => {
    const isActive = !user.deletedAt;

    if (!isActive) {
      return [];
    }

    const assignedRoles = getAssignedRoles(user);
    const availableRoles = PROJECT_MEMBER_ROLES.filter(role => {
      const hasAssignedRole = assignedRoles.includes(role);
      const roleHasMember = members.some(member => member.role === role);

      return hasAssignedRole && !roleHasMember;
    });

    return availableRoles.map(role => ({ user, role }));
  });

export const toApartmentTeamOptions = (
  candidates: IApartmentTeamCandidate[],
): (IApartmentTeamCandidate & { label: string })[] =>
  candidates.map(({ user, role }) => ({
    user,
    role,
    label: `${getFullName(user)} · ${USER_ROLE_LABELS[role]} (${user.employeeNumber})`,
  }));

export const formatParentCustomerNote = (building: IApiProject) =>
  `לקוח הפרויקט האב: ${building.customer?.name ?? building.customerName ?? "לא שויך לקוח"}. הוא אינו לקוח הקצה של הדירה ואינו עובר אליה.`;

export const formatApartmentValidationCount = (count: number) =>
  `יש ${count} שדות לתיקון לפני ההוספה`;

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
  stages.map(stage => ({ id: stage.id, label: stage.name, dotColor: stage.color }));

export const formatApartmentUnit = (apartment: IApiProject) =>
  `${formatFloor(apartment)} · ${formatApartmentNumber(apartment)}`;
