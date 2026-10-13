import type {
  IStageTile,
  IApartmentPosition,
  IApartmentFormValues,
  TInheritanceSourceType,
} from "../interfaces/apartment.interface";

import { theme } from "../constants/theme.constants";
import type { IApartmentPayload } from "../interfaces/api-request.interface";
import { ALL_STAGES_TILE_ID, BUILDING_PAGE_COPY } from "../constants/apartment.constant";
import { APARTMENT_PEOPLE_FIELDS, APARTMENT_UNIT_FIELDS } from "../constants/apartment.constant";
import type {
  IApiProject,
  IApiProjectStage,
  IProjectStageCounts,
} from "../interfaces/api.interface";

export type ProjectKindType = "building" | "apartment" | "standalone";

const APARTMENT_FORM_FIELDS = [...APARTMENT_UNIT_FIELDS, ...APARTMENT_PEOPLE_FIELDS];

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

const toOptionalText = (value: string) => value.trim() || null;

export const toApartmentPayload = (values: IApartmentFormValues): IApartmentPayload => ({
  customerFloor: Number(values.floor),
  contactName: values.contactName.trim(),
  contactPhone: values.contactPhone.trim(),
  customerApartment: values.apartmentNumber.trim(),
  customerName: toOptionalText(values.customerName),
  customerPhone: toOptionalText(values.customerPhone),
});

export const countInvalidApartmentFields = (values: IApartmentFormValues) =>
  APARTMENT_FORM_FIELDS.filter(config => !config.validate(values[config.field]).isValid).length;

export const getPaymentTermsSource = (apartment: IApiProject): TInheritanceSourceType => {
  const isInherited = apartment.inheritedFields?.includes("paymentTerms") ?? false;

  if (isInherited) {
    return "building";
  }

  return "overridden";
};

export const toStageTiles = (
  stages: IApiProjectStage[],
  counts: IProjectStageCounts | null,
): IStageTile[] => [
  {
    id: ALL_STAGES_TILE_ID,
    count: counts?.total ?? 0,
    label: BUILDING_PAGE_COPY.ALL_STAGES,
    dotColor: theme.palette.textMuted,
  },
  ...stages.map(stage => ({
    id: stage.id,
    label: stage.name,
    count: counts?.byStage[stage.id] ?? 0,
    dotColor: stage.color ?? theme.palette.statusGray,
  })),
];

export const toStageFilter = (tileId: string) => {
  if (tileId === ALL_STAGES_TILE_ID) {
    return null;
  }

  return tileId;
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

export const isNearScrollEnd = (element: HTMLElement, threshold: number) =>
  element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
