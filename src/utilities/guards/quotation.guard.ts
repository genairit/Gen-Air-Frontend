import {
  isRecord,
  isArrayOf,
  isOptionalOf,
  hasStringFields,
  isNullableNumber,
  isNullableString,
} from "./primitive.guard";

import {
  isQuotationProjectRole,
  isQuotationPrimaryProject,
  isQuotationApartmentLinkList,
} from "./quotation-sharing.guard";

import {
  CONTROL_KIND,
  EQUIPMENT_ROLE,
  QUOTATION_STATUS,
  QUOTATION_SYSTEM,
  CATALOGUE_STATUS,
  QUOTATION_CANCELLATION_KIND,
  MAX_QUOTATION_CANCELLATION_REASON_LENGTH,
} from "../../constants/quotation.constant";

import type {
  IQuotation,
  IQuotationLine,
  IQuotationPage,
  ICatalogueItem,
  TQuotationStatus,
  TQuotationSystem,
  IQuotationSection,
  IQuotationWarning,
  IProjectQuotation,
  IProjectQuotationPage,
  IQuotationCancellation,
  IQuotationSalesAgent,
  IQuotationProjectChoice,
} from "../../interfaces/quotation.interface";

import { isPaymentTerms } from "./api.guard";
import type { IQuotationStatusCounts } from "../../interfaces/quotation.interface";
import type { TQuotationRestorableStatus } from "../../constants/quotation.constant";

const isString = (value: unknown): value is string => typeof value === "string";

export const isQuotationStatus = (value: unknown): value is TQuotationStatus =>
  Object.values(QUOTATION_STATUS).some(status => status === value);
const isRestorableQuotationStatus = (value: unknown): value is TQuotationRestorableStatus =>
  value === QUOTATION_STATUS.DRAFT ||
  value === QUOTATION_STATUS.REVIEW ||
  value === QUOTATION_STATUS.APPROVED;
const isQuotationCancellation = (value: unknown): value is IQuotationCancellation =>
  isRecord(value) &&
  Object.values(QUOTATION_CANCELLATION_KIND).some(kind => kind === value.kind) &&
  isRestorableQuotationStatus(value.fromStatus) &&
  hasStringFields(value, ["cancelledAt", "cancelledById", "cancelledByName", "reason"]) &&
  typeof value.reason === "string" &&
  value.reason.trim().length > 0 &&
  value.reason.length <= MAX_QUOTATION_CANCELLATION_REASON_LENGTH &&
  isNullableString(value.restoredAt) &&
  isNullableString(value.restoredById) &&
  isNullableString(value.restoredByName);
export const isQuotationSystem = (value: unknown): value is TQuotationSystem =>
  Object.values(QUOTATION_SYSTEM).some(system => system === value);
export const isDecimal = (value: unknown): value is string =>
  typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value));
const isNonnegativeDecimal = (value: unknown): boolean => isDecimal(value) && Number(value) >= 0;
const isPositiveDecimal = (value: unknown): boolean => isDecimal(value) && Number(value) > 0;
const isControlKind = (value: unknown): boolean =>
  value === null || Object.values(CONTROL_KIND).some(kind => kind === value);
const isEquipmentRole = (value: unknown): boolean =>
  Object.values(EQUIPMENT_ROLE).some(role => role === value);
export const isCatalogueItem = (value: unknown): value is ICatalogueItem => {
  if (!isRecord(value)) {
    return false;
  }
  const identity = hasStringFields(value, [
    "id",
    "sku",
    "description",
    "unit",
    "brand",
    "preference",
  ]);
  const metadata =
    Object.values(CATALOGUE_STATUS).some(status => status === value.status) &&
    isEquipmentRole(value.equipmentRole) &&
    Array.isArray(value.equipmentTypes) &&
    value.equipmentTypes.every(type => typeof type === "string");
  const equipment =
    (value.systemType === null || value.systemType === "" || isQuotationSystem(value.systemType)) &&
    isNullableNumber(value.capacityBtu) &&
    typeof value.includesRemote === "boolean" &&
    typeof value.includesThermostat === "boolean";
  return identity && metadata && equipment && isNonnegativeDecimal(value.price);
};
export const isQuotationLine = (value: unknown): value is IQuotationLine => {
  if (!isRecord(value)) {
    return false;
  }
  const identity = hasStringFields(value, [
    "id",
    "catalogueItemId",
    "sku",
    "description",
    "unit",
    "location",
  ]);
  const values = isNonnegativeDecimal(value.quotedPrice) && isPositiveDecimal(value.quantity);
  const metadata =
    isNullableString(value.parentItemId) &&
    isNullableString(value.circuit) &&
    isNullableString(value.equipmentType) &&
    isControlKind(value.controlKind) &&
    isEquipmentRole(value.equipmentRole);
  const equipment =
    isNullableNumber(value.capacityBtu) &&
    isNullableNumber(value.requestedCapacityBtu) &&
    typeof value.includesRemote === "boolean" &&
    typeof value.includesThermostat === "boolean";
  return identity && values && metadata && equipment;
};
export const isQuotationSection = (value: unknown): value is IQuotationSection =>
  isRecord(value) &&
  hasStringFields(value, ["id", "title"]) &&
  isQuotationSystem(value.systemType) &&
  isNullableString(value.brand) &&
  Array.isArray(value.items) &&
  value.items.every(isQuotationLine);
export const isQuotationWarning = (value: unknown): value is IQuotationWarning =>
  isRecord(value) &&
  hasStringFields(value, ["key", "text"]) &&
  typeof value.acknowledged === "boolean";
const hasQuotationIdentity = (value: { [field: string]: unknown }): boolean =>
  hasStringFields(value, [
    "id",
    "number",
    "customerId",
    "date",
    "brand",
    "paymentTermsNote",
    "internalNotes",
    "updatedAt",
  ]) &&
  isQuotationStatus(value.status) &&
  Array.isArray(value.brands) &&
  value.brands.every((brand: unknown) => typeof brand === "string" && brand.length > 0) &&
  new Set(value.brands).size === value.brands.length &&
  (value.brands[0] ?? "") === value.brand &&
  Number.isInteger(value.version) &&
  Number(value.version) > 0 &&
  isNullableString(value.projectId) &&
  (value.cancelledFromStatus === null || isRestorableQuotationStatus(value.cancelledFromStatus)) &&
  Array.isArray(value.cancellationHistory) &&
  value.cancellationHistory.every(isQuotationCancellation) &&
  isNullableString(value.salesAgentId) &&
  isOptionalOf(isNullableString)(value.salesAgentName) &&
  isOptionalOf(isNullableString)(value.customerName) &&
  isOptionalOf(isNullableString)(value.projectName) &&
  isOptionalOf(isQuotationPrimaryProject)(value.primaryProject) &&
  isOptionalOf(isQuotationApartmentLinkList)(value.apartmentLinks);
const hasQuotationFinancials = (value: { [field: string]: unknown }): boolean =>
  isNonnegativeDecimal(value.discountPercent) &&
  isNonnegativeDecimal(value.vatRate) &&
  (value.targetPretaxAmount === null || isNonnegativeDecimal(value.targetPretaxAmount)) &&
  (value.paymentTerms === null || isPaymentTerms(value.paymentTerms));
const isQuotationTotals = (value: unknown): boolean =>
  isRecord(value) &&
  ["subtotal", "discount", "pretax", "vat", "total"].every(key => isDecimal(value[key]));
const isPaymentSchedule = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    stage =>
      isRecord(stage) && isNonnegativeDecimal(stage.percent) && typeof stage.text === "string",
  );
export const isQuotation = (value: unknown): value is IQuotation => {
  if (!isRecord(value)) {
    return false;
  }
  const sections = Array.isArray(value.sections) && value.sections.every(isQuotationSection);
  const warnings = Array.isArray(value.warnings) && value.warnings.every(isQuotationWarning);
  return (
    hasQuotationIdentity(value) &&
    hasQuotationFinancials(value) &&
    sections &&
    warnings &&
    isQuotationTotals(value.totals) &&
    isPaymentSchedule(value.paymentSchedule)
  );
};
export const isQuotationList = (value: unknown): value is IQuotation[] =>
  Array.isArray(value) && value.every(isQuotation);
export const isCatalogueList = (value: unknown): value is ICatalogueItem[] =>
  Array.isArray(value) && value.every(isCatalogueItem);
export const isQuotationPage = (value: unknown): value is IQuotationPage =>
  isRecord(value) && isQuotationList(value.items) && isNullableString(value.nextCursor);
export const isProjectQuotation = (value: unknown): value is IProjectQuotation =>
  isQuotation(value) &&
  isRecord(value) &&
  Number.isSafeInteger(value.sharedCount) &&
  isNullableString(value.sharedFromCode) &&
  isQuotationProjectRole(value.projectRole) &&
  isArrayOf(isString)(value.sharedApartmentNumbers);
export const isProjectQuotationPage = (value: unknown): value is IProjectQuotationPage =>
  isRecord(value) &&
  Number.isSafeInteger(value.total) &&
  isNullableString(value.nextCursor) &&
  isArrayOf(isProjectQuotation)(value.items);
export const isQuotationProjectChoice = (value: unknown): value is IQuotationProjectChoice =>
  isRecord(value) && hasStringFields(value, ["id", "name"]);
export const isQuotationSalesAgent = (value: unknown): value is IQuotationSalesAgent =>
  isRecord(value) && hasStringFields(value, ["id", "firstName", "lastName", "employeeNumber"]);

export const isQuotationStatusCounts = (value: unknown): value is IQuotationStatusCounts => {
  if (!isRecord(value)) {
    return false;
  }
  const counts = [value.all, value.draft, value.review, value.approved, value.cancelled];
  return (
    counts.every(count => typeof count === "number" && Number.isSafeInteger(count) && count >= 0) &&
    value.all ===
      Number(value.draft) + Number(value.review) + Number(value.approved) + Number(value.cancelled)
  );
};
