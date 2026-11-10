import {
  isRecord,
  isArrayOf,
  hasStringFields,
  isNullableNumber,
  isNullableString,
} from "./primitive.guard";

import type {
  IQuotationApartment,
  IQuotationApartmentLink,
  IQuotationPrimaryProject,
  IQuotationApartmentOptions,
} from "../../interfaces/quotation.interface";

import {
  QUOTATION_PROJECT_KIND,
  QUOTATION_PROJECT_ROLE,
  type TQuotationProjectKind,
  type TQuotationProjectRole,
} from "../../constants/quotation-sharing.constant";

export const isQuotationProjectKind = (value: unknown): value is TQuotationProjectKind =>
  Object.values(QUOTATION_PROJECT_KIND).some(kind => kind === value);

export const isQuotationProjectRole = (value: unknown): value is TQuotationProjectRole =>
  Object.values(QUOTATION_PROJECT_ROLE).some(role => role === value);

export const isQuotationPrimaryProject = (value: unknown): value is IQuotationPrimaryProject =>
  isRecord(value) &&
  hasStringFields(value, ["id", "name", "code"]) &&
  isQuotationProjectKind(value.kind);

export const isQuotationApartment = (value: unknown): value is IQuotationApartment =>
  isRecord(value) &&
  typeof value.apartmentId === "string" &&
  isNullableNumber(value.floor) &&
  isNullableString(value.apartmentNumber) &&
  isNullableString(value.endCustomerName);

export const isQuotationApartmentLink = (value: unknown): value is IQuotationApartmentLink =>
  isQuotationApartment(value) && isRecord(value) && typeof value.available === "boolean";

export const isQuotationApartmentLinkList = isArrayOf(isQuotationApartmentLink);

export const isQuotationApartmentOptions = (value: unknown): value is IQuotationApartmentOptions =>
  isRecord(value) &&
  isQuotationPrimaryProject(value.building) &&
  isArrayOf(isQuotationApartment)(value.apartments);
