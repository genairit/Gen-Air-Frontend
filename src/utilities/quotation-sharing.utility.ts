import type {
  IQuotation,
  IProjectQuotation,
  IQuotationApartment,
  IQuotationApartmentLink,
} from "../interfaces/quotation.interface";

import {
  QUOTATION_SHARING_COPY,
  QUOTATION_PROJECT_KIND,
  QUOTATION_PROJECT_ROLE,
  PROJECT_QUOTATIONS_COPY,
  QUOTATION_SHARING_LAYOUT,
  QUOTATION_SHARING_ANCHOR,
} from "../constants/quotation-sharing.constant";

import { buildQuotationPath } from "./route.utility";
import { QUOTATION_STATUS } from "../constants/quotation.constant";
import { isolateBidiText, formatParenthesizedCount } from "./text.utility";
import { formatFloorLabel, formatApartmentNumberLabel } from "./apartment.utility";

interface IApartmentRemovalCount {
  savedIds: string[];
  draftIds: string[];
}

export const formatApartmentChoice = (apartment: IQuotationApartment) =>
  `${formatApartmentNumberLabel(apartment.apartmentNumber)} · ${formatFloorLabel(apartment.floor)}`;

export const formatEndCustomerName = (apartment: IQuotationApartment) =>
  apartment.endCustomerName ?? QUOTATION_SHARING_COPY.NO_END_CUSTOMER;

export const formatApartmentChoiceLabel = (apartment: IQuotationApartment) =>
  `${QUOTATION_SHARING_COPY.CHECKBOX_PREFIX} ${formatApartmentChoice(apartment)} · ${formatEndCustomerName(apartment)}`;

export const formatSharedCount = (count: number) =>
  `${QUOTATION_SHARING_COPY.SHARED_PREFIX}${count} ${QUOTATION_SHARING_COPY.APARTMENTS_SUFFIX}`;

export const formatRemovalNotice = (count: number) =>
  `${QUOTATION_SHARING_COPY.REMOVAL_PREFIX}${count} ${QUOTATION_SHARING_COPY.APARTMENTS_SUFFIX}.`;

export const formatSelectAll = (count: number) =>
  `${QUOTATION_SHARING_COPY.SELECT_ALL} ${formatParenthesizedCount(count)}`;

export const formatSharedFromBuilding = (code: string | null) =>
  `${QUOTATION_SHARING_COPY.SHARED_FROM_BUILDING} ${isolateBidiText(code ?? "")}`;

export const formatSelectedCount = (count: number) =>
  `${count} ${QUOTATION_SHARING_COPY.SELECTED_SUFFIX}`;

export const formatApartmentPreview = (numbers: string[]) => {
  const visibleNumbers = numbers.slice(0, QUOTATION_SHARING_LAYOUT.APARTMENT_PREVIEW_COUNT);
  const hiddenCount = numbers.length - visibleNumbers.length;
  const preview = `${QUOTATION_SHARING_COPY.APARTMENTS_PREVIEW_PREFIX} ${visibleNumbers.join(", ")}`;

  if (hiddenCount === 0) {
    return preview;
  }

  return `${preview} +${hiddenCount}`;
};

export const isBuildingQuotation = (quotation: IQuotation) =>
  quotation.primaryProject?.kind === QUOTATION_PROJECT_KIND.BUILDING;

export const isApprovedQuotation = (quotation: IQuotation) =>
  quotation.status === QUOTATION_STATUS.APPROVED;

export const isSharedFromBuilding = (quotation: IProjectQuotation) =>
  quotation.projectRole === QUOTATION_PROJECT_ROLE.SHARED;

export const isSharedWithApartments = (quotation: IProjectQuotation) =>
  quotation.projectRole === QUOTATION_PROJECT_ROLE.PRIMARY && quotation.sharedCount > 0;

export const availableApartmentIds = (links: IQuotationApartmentLink[]) =>
  links.filter(link => link.available).map(link => link.apartmentId);

export const unavailableApartmentLinks = (links: IQuotationApartmentLink[]) =>
  links.filter(link => !link.available);

const toSearchText = (apartment: IQuotationApartment) =>
  [
    apartment.apartmentNumber,
    apartment.floor === null ? null : String(apartment.floor),
    apartment.endCustomerName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const filterApartments = (apartments: IQuotationApartment[], search: string) => {
  const term = search.trim().toLowerCase();

  if (!term) {
    return apartments;
  }

  return apartments.filter(apartment => toSearchText(apartment).includes(term));
};

export const countRemovedApartments = ({ savedIds, draftIds }: IApartmentRemovalCount) =>
  savedIds.filter(id => !draftIds.includes(id)).length;

export const hasSameIds = (first: string[], second: string[]) =>
  first.length === second.length && first.every(id => second.includes(id));

export const formatBuildingSubtitle = (quotation: IQuotation) => {
  const building = quotation.primaryProject;

  if (!building) {
    return "";
  }

  return `${building.name} · ${isolateBidiText(building.code)}`;
};

export const formatProjectQuotationsSubtitle = (total: number) =>
  `${total} ${PROJECT_QUOTATIONS_COPY.SUBTITLE_SUFFIX}`;

export const buildProjectQuotationPath = (quotation: IProjectQuotation) => {
  const path = buildQuotationPath(quotation.id);

  if (isSharedFromBuilding(quotation)) {
    return path;
  }

  return `${path}#${QUOTATION_SHARING_ANCHOR.CARD_ID}`;
};
